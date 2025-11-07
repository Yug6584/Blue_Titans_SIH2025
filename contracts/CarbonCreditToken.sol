// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DecentralizedIdentity.sol";
import "./AuditTransparency.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC721 token representing individual carbon credits (1 token = 1 ton CO2)
 * @notice Each token represents a unique carbon credit with full provenance tracking
 */
contract CarbonCreditToken is ERC721, ERC721URIStorage, Pausable, ReentrancyGuard {
    DecentralizedIdentity public immutable identityContract;
    AuditTransparency public immutable auditContract;
    uint256 private _tokenIdCounter;

    struct CreditInfo {
        string projectId;
        string metadataHash; // IPFS hash
        uint256 mintTime;
        address minter;
        bool isRetired;
        uint256 retireTime;
        address retiredBy;
        string retirementReason;
    }

    mapping(uint256 => CreditInfo) public creditInfo;
    mapping(uint256 => bool) public retired;
    mapping(string => uint256[]) public projectCredits;
    mapping(address => uint256[]) public ownerCredits;
    
    uint256[] public allTokenIds;
    uint256 public totalRetired;

    event CreditMinted(
        uint256 indexed tokenId,
        address indexed to,
        string indexed projectId,
        string metadataHash
    );
    
    event CreditRetired(
        uint256 indexed tokenId,
        address indexed retiredBy,
        string reason,
        uint256 retireTime
    );

    modifier onlySystemRole() {
        require(
            identityContract.checkRole(msg.sender, identityContract.SYSTEM_ROLE()),
            "Only system role can perform this action"
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

    modifier notRetired(uint256 tokenId) {
        require(!retired[tokenId], "Token is retired");
        _;
    }

    /**
     * @dev Constructor
     * @param _identityContract Address of the DecentralizedIdentity contract
     * @param _auditContract Address of the AuditTransparency contract
     */
    constructor(
        address _identityContract,
        address _auditContract
    ) ERC721("Blue Carbon Credit", "BCC") {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        require(_auditContract != address(0), "Audit contract cannot be zero address");
        
        identityContract = DecentralizedIdentity(_identityContract);
        auditContract = AuditTransparency(_auditContract);
    }

    /**
     * @notice Mint a new carbon credit token
     * @param to Address to mint the token to
     * @param projectId Project ID associated with the credit
     * @param metadataHash IPFS hash containing credit metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintCredit(
        address to,
        string calldata projectId,
        string calldata metadataHash
    ) external onlySystemRole whenNotPaused nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        creditInfo[tokenId] = CreditInfo({
            projectId: projectId,
            metadataHash: metadataHash,
            mintTime: block.timestamp,
            minter: msg.sender,
            isRetired: false,
            retireTime: 0,
            retiredBy: address(0),
            retirementReason: ""
        });

        // Index the token
        allTokenIds.push(tokenId);
        projectCredits[projectId].push(tokenId);
        ownerCredits[to].push(tokenId);

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataHash);

        // Record audit event
        auditContract.recordEvent(
            projectId,
            AuditTransparency.ActionType.CREDIT_MINTED,
            1, // 1 credit = 1 ton CO2
            metadataHash,
            "Carbon credit minted"
        );

        emit CreditMinted(tokenId, to, projectId, metadataHash);
        
        return tokenId;
    }

    /**
     * @notice Retire a carbon credit token
     * @param tokenId The token ID to retire
     * @param reason Reason for retirement
     */
    function retireCredit(uint256 tokenId, string calldata reason) 
        external 
        whenNotPaused 
        nonReentrant 
        notRetired(tokenId) 
    {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        require(
            owner == msg.sender || 
            getApproved(tokenId) == msg.sender || 
            isApprovedForAll(owner, msg.sender) ||
            identityContract.checkRole(msg.sender, identityContract.SYSTEM_ROLE()),
            "Not authorized to retire this token"
        );
        require(bytes(reason).length > 0, "Retirement reason cannot be empty");

        retired[tokenId] = true;
        totalRetired++;
        
        creditInfo[tokenId].isRetired = true;
        creditInfo[tokenId].retireTime = block.timestamp;
        creditInfo[tokenId].retiredBy = msg.sender;
        creditInfo[tokenId].retirementReason = reason;

        // Record audit event
        auditContract.recordEvent(
            creditInfo[tokenId].projectId,
            AuditTransparency.ActionType.CREDIT_RETIRED,
            1,
            "",
            reason
        );

        emit CreditRetired(tokenId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Override update function to prevent transfer of retired tokens and record events
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        whenNotPaused
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        if (from != address(0) && to != address(0)) { // Transfer (not mint/burn)
            require(!retired[tokenId], "Cannot transfer retired token");
        }
        
        address previousOwner = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0)) { // Transfer completed
            // Update owner credits mapping
            _removeFromOwnerCredits(from, tokenId);
            ownerCredits[to].push(tokenId);
            
            // Record audit event
            auditContract.recordEvent(
                creditInfo[tokenId].projectId,
                AuditTransparency.ActionType.CREDIT_TRANSFERRED,
                1,
                "",
                "Carbon credit transferred"
            );
        }
        
        return previousOwner;
    }

    /**
     * @notice Get credit information
     * @param tokenId The token ID to query
     * @return CreditInfo struct containing credit details
     */
    function getCreditInfo(uint256 tokenId) external view returns (CreditInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return creditInfo[tokenId];
    }

    /**
     * @notice Get all credits for a project
     * @param projectId The project ID to query
     * @return Array of token IDs for the project
     */
    function getCreditsByProject(string calldata projectId) external view returns (uint256[] memory) {
        return projectCredits[projectId];
    }

    /**
     * @notice Get all credits owned by an address
     * @param owner The owner address
     * @return Array of token IDs owned by the address
     */
    function getCreditsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerCredits[owner];
    }

    /**
     * @notice Get total supply of tokens
     * @return Total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Get active (non-retired) supply
     * @return Number of active tokens
     */
    function activeSupply() external view returns (uint256) {
        return _tokenIdCounter - totalRetired;
    }

    /**
     * @notice Check if a token is retired
     * @param tokenId The token ID to check
     * @return bool True if token is retired
     */
    function isRetired(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return retired[tokenId];
    }

    /**
     * @notice Get all token IDs
     * @return Array of all token IDs
     */
    function getAllTokenIds() external view returns (uint256[] memory) {
        return allTokenIds;
    }

    /**
     * @dev Remove token from owner's credits array
     */
    function _removeFromOwnerCredits(address owner, uint256 tokenId) private {
        uint256[] storage credits = ownerCredits[owner];
        for (uint256 i = 0; i < credits.length; i++) {
            if (credits[i] == tokenId) {
                credits[i] = credits[credits.length - 1];
                credits.pop();
                break;
            }
        }
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

    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}