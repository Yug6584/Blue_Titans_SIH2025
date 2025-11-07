// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DecentralizedIdentity.sol";
import "./AuditTransparency.sol";
import "./CarbonCreditToken.sol";

/**
 * @title CarbonMarketBridge
 * @dev Bridge for retiring carbon credits on external registries
 * @notice Enables interoperability with external carbon markets and registries
 */
contract CarbonMarketBridge is Pausable, ReentrancyGuard {
    DecentralizedIdentity public immutable identityContract;
    AuditTransparency public immutable auditContract;
    CarbonCreditToken public immutable creditToken;

    uint256 private _retirementCounter;

    struct ExternalRegistry {
        string name;
        address registryAddress;
        bool isActive;
        uint256 registrationTime;
        address registeredBy;
        string description;
    }

    struct RetirementRecord {
        uint256 retirementId;
        address company;
        uint256[] tokenIds;
        uint256 amount;
        string registryName;
        string offchainProofHash; // IPFS hash of retirement proof
        uint256 retirementTime;
        address retiredBy;
        string purpose;
        bool isProcessed;
    }

    mapping(string => ExternalRegistry) public externalRegistries;
    mapping(string => bool) public registryExists;
    mapping(uint256 => RetirementRecord) public retirements;
    mapping(address => uint256[]) public companyRetirements;
    mapping(string => uint256[]) public registryRetirements;

    string[] public allRegistryNames;
    uint256[] public allRetirementIds;

    event RegistryRegistered(
        string indexed registryName,
        address indexed registryAddress,
        address indexed registeredBy
    );

    event RegistryUpdated(
        string indexed registryName,
        bool isActive,
        address indexed updatedBy
    );

    event CreditRetired(
        uint256 indexed retirementId,
        address indexed company,
        uint256 amount,
        string indexed registryName,
        string offchainProofHash
    );

    event ESGProofGenerated(
        uint256 indexed retirementId,
        address indexed company,
        string proofHash,
        string purpose
    );

    modifier onlyCompanyOrGovernment() {
        require(
            identityContract.checkRole(msg.sender, identityContract.COMPANY_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()),
            "Only companies or government can perform this action"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Only admin can perform this action"
        );
        _;
    }

    /**
     * @dev Constructor
     * @param _identityContract Address of the DecentralizedIdentity contract
     * @param _auditContract Address of the AuditTransparency contract
     * @param _creditToken Address of the CarbonCreditToken contract
     */
    constructor(
        address _identityContract,
        address _auditContract,
        address _creditToken
    ) {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        require(_auditContract != address(0), "Audit contract cannot be zero address");
        require(_creditToken != address(0), "Credit token cannot be zero address");

        identityContract = DecentralizedIdentity(_identityContract);
        auditContract = AuditTransparency(_auditContract);
        creditToken = CarbonCreditToken(_creditToken);
    }

    /**
     * @notice Register an external carbon registry
     * @param name Name of the registry
     * @param registryAddress Address of the registry contract (can be zero for off-chain registries)
     * @param description Description of the registry
     */
    function registerRegistry(
        string calldata name,
        address registryAddress,
        string calldata description
    ) external onlyAdmin whenNotPaused {
        require(bytes(name).length > 0, "Registry name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(!registryExists[name], "Registry already exists");

        externalRegistries[name] = ExternalRegistry({
            name: name,
            registryAddress: registryAddress,
            isActive: true,
            registrationTime: block.timestamp,
            registeredBy: msg.sender,
            description: description
        });

        registryExists[name] = true;
        allRegistryNames.push(name);

        emit RegistryRegistered(name, registryAddress, msg.sender);
    }

    /**
     * @notice Update registry status
     * @param registryName Name of the registry to update
     * @param isActive New active status
     */
    function updateRegistryStatus(
        string calldata registryName,
        bool isActive
    ) external onlyAdmin whenNotPaused {
        require(registryExists[registryName], "Registry does not exist");

        externalRegistries[registryName].isActive = isActive;

        emit RegistryUpdated(registryName, isActive, msg.sender);
    }

    /**
     * @notice Retire carbon credits on an external bridge/registry
     * @param company Company retiring the credits
     * @param tokenIds Array of token IDs to retire
     * @param registryName Name of the external registry
     * @param offchainProofHash IPFS hash of retirement proof
     * @param purpose Purpose of the retirement (e.g., "Annual ESG Report 2024")
     * @return retirementId The ID of the retirement record
     */
    function retireCreditsOnBridge(
        address company,
        uint256[] calldata tokenIds,
        string calldata registryName,
        string calldata offchainProofHash,
        string calldata purpose
    ) external onlyCompanyOrGovernment whenNotPaused nonReentrant returns (uint256) {
        require(company != address(0), "Company cannot be zero address");
        require(tokenIds.length > 0, "Must retire at least one token");
        require(registryExists[registryName], "Registry does not exist");
        require(externalRegistries[registryName].isActive, "Registry is not active");
        require(bytes(offchainProofHash).length > 0, "Proof hash cannot be empty");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");

        // Verify ownership and retire tokens
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(creditToken.ownerOf(tokenId) == company, "Company does not own token");
            require(!creditToken.isRetired(tokenId), "Token is already retired");
            
            // Retire the token
            creditToken.retireCredit(tokenId, string(abi.encodePacked("Bridge retirement: ", purpose)));
        }

        _retirementCounter++;
        uint256 retirementId = _retirementCounter;

        retirements[retirementId] = RetirementRecord({
            retirementId: retirementId,
            company: company,
            tokenIds: tokenIds,
            amount: tokenIds.length,
            registryName: registryName,
            offchainProofHash: offchainProofHash,
            retirementTime: block.timestamp,
            retiredBy: msg.sender,
            purpose: purpose,
            isProcessed: true
        });

        // Index the retirement
        allRetirementIds.push(retirementId);
        companyRetirements[company].push(retirementId);
        registryRetirements[registryName].push(retirementId);

        // Record audit event
        auditContract.recordEvent(
            "", // No specific project ID for bridge retirements
            AuditTransparency.ActionType.BRIDGE_RETIREMENT,
            tokenIds.length,
            offchainProofHash,
            string(abi.encodePacked("Bridge retirement on ", registryName, ": ", purpose))
        );

        emit CreditRetired(retirementId, company, tokenIds.length, registryName, offchainProofHash);
        emit ESGProofGenerated(retirementId, company, offchainProofHash, purpose);

        return retirementId;
    }

    /**
     * @notice Retire a specific amount of credits (for fungible use case)
     * @param company Company retiring the credits
     * @param amount Amount of credits to retire
     * @param registryName Name of the external registry
     * @param offchainProofHash IPFS hash of retirement proof
     * @param purpose Purpose of the retirement
     * @return retirementId The ID of the retirement record
     */
    function retireCreditsAmountOnBridge(
        address company,
        uint256 amount,
        string calldata registryName,
        string calldata offchainProofHash,
        string calldata purpose
    ) external onlyCompanyOrGovernment whenNotPaused nonReentrant returns (uint256) {
        require(company != address(0), "Company cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(registryExists[registryName], "Registry does not exist");
        require(externalRegistries[registryName].isActive, "Registry is not active");
        require(bytes(offchainProofHash).length > 0, "Proof hash cannot be empty");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");

        // Get company's credits and retire the specified amount
        uint256[] memory companyTokens = creditToken.getCreditsByOwner(company);
        require(companyTokens.length >= amount, "Insufficient credits owned by company");

        uint256[] memory tokensToRetire = new uint256[](amount);
        uint256 retiredCount = 0;

        for (uint256 i = 0; i < companyTokens.length && retiredCount < amount; i++) {
            uint256 tokenId = companyTokens[i];
            if (!creditToken.isRetired(tokenId)) {
                tokensToRetire[retiredCount] = tokenId;
                creditToken.retireCredit(tokenId, string(abi.encodePacked("Bridge retirement: ", purpose)));
                retiredCount++;
            }
        }

        require(retiredCount == amount, "Could not retire the requested amount");

        _retirementCounter++;
        uint256 retirementId = _retirementCounter;

        retirements[retirementId] = RetirementRecord({
            retirementId: retirementId,
            company: company,
            tokenIds: tokensToRetire,
            amount: amount,
            registryName: registryName,
            offchainProofHash: offchainProofHash,
            retirementTime: block.timestamp,
            retiredBy: msg.sender,
            purpose: purpose,
            isProcessed: true
        });

        // Index the retirement
        allRetirementIds.push(retirementId);
        companyRetirements[company].push(retirementId);
        registryRetirements[registryName].push(retirementId);

        // Record audit event
        auditContract.recordEvent(
            "",
            AuditTransparency.ActionType.BRIDGE_RETIREMENT,
            amount,
            offchainProofHash,
            string(abi.encodePacked("Bridge retirement on ", registryName, ": ", purpose))
        );

        emit CreditRetired(retirementId, company, amount, registryName, offchainProofHash);
        emit ESGProofGenerated(retirementId, company, offchainProofHash, purpose);

        return retirementId;
    }

    /**
     * @notice Get retirement record
     * @param retirementId The retirement ID to query
     * @return RetirementRecord struct containing retirement details
     */
    function getRetirement(uint256 retirementId) external view returns (RetirementRecord memory) {
        require(retirementId > 0 && retirementId <= _retirementCounter, "Invalid retirement ID");
        return retirements[retirementId];
    }

    /**
     * @notice Get all retirements by a company
     * @param company The company address
     * @return Array of retirement IDs for the company
     */
    function getRetirementsByCompany(address company) external view returns (uint256[] memory) {
        return companyRetirements[company];
    }

    /**
     * @notice Get all retirements for a registry
     * @param registryName The registry name
     * @return Array of retirement IDs for the registry
     */
    function getRetirementsByRegistry(string calldata registryName) external view returns (uint256[] memory) {
        return registryRetirements[registryName];
    }

    /**
     * @notice Get registry information
     * @param registryName The registry name
     * @return ExternalRegistry struct containing registry details
     */
    function getRegistryInfo(string calldata registryName) external view returns (ExternalRegistry memory) {
        require(registryExists[registryName], "Registry does not exist");
        return externalRegistries[registryName];
    }

    /**
     * @notice Get all registry names
     * @return Array of all registry names
     */
    function getAllRegistryNames() external view returns (string[] memory) {
        return allRegistryNames;
    }

    /**
     * @notice Get all retirement IDs
     * @return Array of all retirement IDs
     */
    function getAllRetirementIds() external view returns (uint256[] memory) {
        return allRetirementIds;
    }

    /**
     * @notice Get total number of retirements
     * @return Total count of retirements
     */
    function getTotalRetirements() external view returns (uint256) {
        return _retirementCounter;
    }

    /**
     * @notice Get total number of registries
     * @return Total count of registries
     */
    function getTotalRegistries() external view returns (uint256) {
        return allRegistryNames.length;
    }

    /**
     * @notice Pause the contract (emergency use only)
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}