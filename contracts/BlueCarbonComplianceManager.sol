// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BlueCarbonComplianceManager
 * @dev Smart contract for managing carbon credit compliance and lifecycle control
 * @notice Handles freezing, revoking, reactivating, and verifying carbon credit ownership
 * @author BlueCarbon Ledger Team
 */
contract BlueCarbonComplianceManager is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Counter for tracking total projects
    Counters.Counter private _projectCounter;

    // Carbon Credit Structure
    struct CarbonCredit {
        uint256 projectId;
        address owner;
        uint256 totalCredits;
        uint256 availableCredits;
        bool isFrozen;
        bool isRevoked;
        string metadataHash; // IPFS hash for project details
        uint256 issuedAt;
        uint256 expiresAt;
        string certificateHash;
    }

    // Compliance Action Structure
    struct ComplianceAction {
        uint256 projectId;
        address performedBy;
        string actionType; // FREEZE, REVOKE, REACTIVATE
        string reason;
        uint256 timestamp;
        bytes32 txHash;
    }

    // Mappings
    mapping(uint256 => CarbonCredit) public credits;
    mapping(uint256 => address) public projectOwner;
    mapping(address => uint256[]) public ownerProjects;
    mapping(uint256 => ComplianceAction[]) public complianceHistory;
    mapping(bytes32 => bool) public usedHashes; // Prevent replay attacks

    // State variables
    uint256 public totalProjectsIssued;
    uint256 public totalCreditsIssued;
    uint256 public totalCreditsFrozen;
    uint256 public totalCreditsRevoked;

    // Events
    event CreditsIssued(
        uint256 indexed projectId,
        address indexed owner,
        uint256 totalCredits,
        string metadataHash,
        uint256 timestamp
    );

    event CreditsFrozen(
        uint256 indexed projectId,
        address indexed performedBy,
        string reason,
        uint256 timestamp
    );

    event CreditsRevoked(
        uint256 indexed projectId,
        address indexed performedBy,
        string reason,
        uint256 creditsRevoked,
        uint256 timestamp
    );

    event CreditsReactivated(
        uint256 indexed projectId,
        address indexed performedBy,
        string reason,
        uint256 timestamp
    );

    event CreditsTransferred(
        uint256 indexed projectId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event ComplianceActionLogged(
        uint256 indexed projectId,
        address indexed performedBy,
        string actionType,
        string reason,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyProjectOwner(uint256 projectId) {
        require(
            credits[projectId].owner == msg.sender,
            "Only project owner can perform this action"
        );
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(
            credits[projectId].projectId != 0,
            "Project does not exist"
        );
        _;
    }

    modifier notFrozen(uint256 projectId) {
        require(
            !credits[projectId].isFrozen,
            "Project credits are frozen"
        );
        _;
    }

    modifier notRevoked(uint256 projectId) {
        require(
            !credits[projectId].isRevoked,
            "Project credits are revoked"
        );
        _;
    }

    /**
     * @dev Constructor sets up roles and initial state
     */
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNMENT_ROLE, msg.sender);
        
        // Set role admin relationships
        _setRoleAdmin(GOVERNMENT_ROLE, ADMIN_ROLE);
        _setRoleAdmin(COMPANY_ROLE, ADMIN_ROLE);
        _setRoleAdmin(AUDITOR_ROLE, ADMIN_ROLE);
    }

    /**
     * @dev Issue new carbon credits for a project
     * @param projectId Unique project identifier
     * @param owner Address of the project owner
     * @param totalCredits Total number of credits to issue
     * @param metadataHash IPFS hash containing project metadata
     * @param certificateHash Hash of the compliance certificate
     * @param validityPeriodDays Number of days the credits are valid
     */
    function issueCredits(
        uint256 projectId,
        address owner,
        uint256 totalCredits,
        string memory metadataHash,
        string memory certificateHash,
        uint256 validityPeriodDays
    ) external onlyRole(GOVERNMENT_ROLE) whenNotPaused {
        require(owner != address(0), "Invalid owner address");
        require(totalCredits > 0, "Credits must be greater than zero");
        require(credits[projectId].projectId == 0, "Project already exists");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        require(bytes(certificateHash).length > 0, "Certificate hash required");

        uint256 expirationTime = block.timestamp + (validityPeriodDays * 1 days);

        credits[projectId] = CarbonCredit({
            projectId: projectId,
            owner: owner,
            totalCredits: totalCredits,
            availableCredits: totalCredits,
            isFrozen: false,
            isRevoked: false,
            metadataHash: metadataHash,
            issuedAt: block.timestamp,
            expiresAt: expirationTime,
            certificateHash: certificateHash
        });

        projectOwner[projectId] = owner;
        ownerProjects[owner].push(projectId);

        // Update global counters
        _projectCounter.increment();
        totalProjectsIssued++;
        totalCreditsIssued += totalCredits;

        // Log compliance action
        _logComplianceAction(projectId, msg.sender, "ISSUED", "Carbon credits issued");

        emit CreditsIssued(projectId, owner, totalCredits, metadataHash, block.timestamp);
    }

    /**
     * @dev Freeze credits for a project (compliance enforcement)
     * @param projectId Project identifier
     * @param reason Reason for freezing
     */
    function pauseCredits(uint256 projectId, string memory reason)
        external
        onlyRole(GOVERNMENT_ROLE)
        projectExists(projectId)
        notRevoked(projectId)
        whenNotPaused
    {
        require(!credits[projectId].isFrozen, "Credits already frozen");
        require(bytes(reason).length > 0, "Reason required");

        credits[projectId].isFrozen = true;
        totalCreditsFrozen += credits[projectId].availableCredits;

        // Log compliance action
        _logComplianceAction(projectId, msg.sender, "FREEZE", reason);

        emit CreditsFrozen(projectId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Revoke credits for a project (permanent invalidation)
     * @param projectId Project identifier
     * @param reason Reason for revocation
     */
    function revokeCredits(uint256 projectId, string memory reason)
        external
        onlyRole(GOVERNMENT_ROLE)
        projectExists(projectId)
        whenNotPaused
    {
        require(!credits[projectId].isRevoked, "Credits already revoked");
        require(bytes(reason).length > 0, "Reason required");

        uint256 creditsToRevoke = credits[projectId].availableCredits;

        credits[projectId].isRevoked = true;
        credits[projectId].isFrozen = true; // Revoked credits are also frozen
        credits[projectId].availableCredits = 0;

        totalCreditsRevoked += creditsToRevoke;
        if (!credits[projectId].isFrozen) {
            totalCreditsFrozen += creditsToRevoke;
        }

        // Log compliance action
        _logComplianceAction(projectId, msg.sender, "REVOKE", reason);

        emit CreditsRevoked(projectId, msg.sender, reason, creditsToRevoke, block.timestamp);
    }

    /**
     * @dev Reactivate frozen credits (unfreeze after compliance restored)
     * @param projectId Project identifier
     * @param reason Reason for reactivation
     */
    function reactivateCredits(uint256 projectId, string memory reason)
        external
        onlyRole(GOVERNMENT_ROLE)
        projectExists(projectId)
        notRevoked(projectId)
        whenNotPaused
    {
        require(credits[projectId].isFrozen, "Credits not frozen");
        require(bytes(reason).length > 0, "Reason required");

        credits[projectId].isFrozen = false;
        totalCreditsFrozen -= credits[projectId].availableCredits;

        // Log compliance action
        _logComplianceAction(projectId, msg.sender, "REACTIVATE", reason);

        emit CreditsReactivated(projectId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Transfer credits between addresses (if not frozen/revoked)
     * @param projectId Project identifier
     * @param to Recipient address
     * @param amount Number of credits to transfer
     */
    function transferCredits(uint256 projectId, address to, uint256 amount)
        external
        projectExists(projectId)
        onlyProjectOwner(projectId)
        notFrozen(projectId)
        notRevoked(projectId)
        nonReentrant
        whenNotPaused
    {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(credits[projectId].availableCredits >= amount, "Insufficient credits");
        require(block.timestamp < credits[projectId].expiresAt, "Credits have expired");

        credits[projectId].availableCredits -= amount;

        // Create new credit entry for recipient or update existing
        // This is a simplified implementation - in practice, you might want
        // to track partial ownership more granularly

        emit CreditsTransferred(projectId, msg.sender, to, amount, block.timestamp);
    }

    /**
     * @dev Get credit status for a project
     * @param projectId Project identifier
     * @return isFrozen Whether credits are frozen
     * @return isRevoked Whether credits are revoked
     * @return owner Project owner address
     * @return totalCredits Total credits issued
     * @return availableCredits Available credits for transfer
     */
    function getCreditStatus(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (
            bool isFrozen,
            bool isRevoked,
            address owner,
            uint256 totalCredits,
            uint256 availableCredits
        )
    {
        CarbonCredit memory credit = credits[projectId];
        return (
            credit.isFrozen,
            credit.isRevoked,
            credit.owner,
            credit.totalCredits,
            credit.availableCredits
        );
    }

    /**
     * @dev Get detailed project information
     * @param projectId Project identifier
     * @return credit Complete CarbonCredit struct
     */
    function getProjectDetails(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (CarbonCredit memory credit)
    {
        return credits[projectId];
    }

    /**
     * @dev Get compliance history for a project
     * @param projectId Project identifier
     * @return actions Array of compliance actions
     */
    function getComplianceHistory(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (ComplianceAction[] memory actions)
    {
        return complianceHistory[projectId];
    }

    /**
     * @dev Get projects owned by an address
     * @param owner Owner address
     * @return projectIds Array of project IDs
     */
    function getOwnerProjects(address owner)
        external
        view
        returns (uint256[] memory projectIds)
    {
        return ownerProjects[owner];
    }

    /**
     * @dev Get global statistics
     * @return stats Array containing [totalProjects, totalCredits, frozenCredits, revokedCredits]
     */
    function getGlobalStats()
        external
        view
        returns (uint256[4] memory stats)
    {
        return [
            totalProjectsIssued,
            totalCreditsIssued,
            totalCreditsFrozen,
            totalCreditsRevoked
        ];
    }

    /**
     * @dev Check if credits are valid and tradeable
     * @param projectId Project identifier
     * @return isValid Whether credits can be traded
     */
    function areCreditsValid(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (bool isValid)
    {
        CarbonCredit memory credit = credits[projectId];
        return (
            !credit.isFrozen &&
            !credit.isRevoked &&
            block.timestamp < credit.expiresAt &&
            credit.availableCredits > 0
        );
    }

    /**
     * @dev Emergency pause function (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause function (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Update project metadata (government only)
     * @param projectId Project identifier
     * @param newMetadataHash New IPFS metadata hash
     */
    function updateProjectMetadata(uint256 projectId, string memory newMetadataHash)
        external
        onlyRole(GOVERNMENT_ROLE)
        projectExists(projectId)
    {
        require(bytes(newMetadataHash).length > 0, "Metadata hash required");
        credits[projectId].metadataHash = newMetadataHash;
        
        _logComplianceAction(projectId, msg.sender, "METADATA_UPDATE", "Project metadata updated");
    }

    /**
     * @dev Extend credit validity period (government only)
     * @param projectId Project identifier
     * @param additionalDays Additional days to extend validity
     */
    function extendValidity(uint256 projectId, uint256 additionalDays)
        external
        onlyRole(GOVERNMENT_ROLE)
        projectExists(projectId)
        notRevoked(projectId)
    {
        require(additionalDays > 0, "Additional days must be positive");
        credits[projectId].expiresAt += (additionalDays * 1 days);
        
        _logComplianceAction(
            projectId,
            msg.sender,
            "VALIDITY_EXTENDED",
            string(abi.encodePacked("Extended by ", _uint2str(additionalDays), " days"))
        );
    }

    /**
     * @dev Internal function to log compliance actions
     * @param projectId Project identifier
     * @param performedBy Address performing the action
     * @param actionType Type of action
     * @param reason Reason for the action
     */
    function _logComplianceAction(
        uint256 projectId,
        address performedBy,
        string memory actionType,
        string memory reason
    ) internal {
        ComplianceAction memory action = ComplianceAction({
            projectId: projectId,
            performedBy: performedBy,
            actionType: actionType,
            reason: reason,
            timestamp: block.timestamp,
            txHash: keccak256(abi.encodePacked(block.timestamp, performedBy, actionType))
        });

        complianceHistory[projectId].push(action);

        emit ComplianceActionLogged(projectId, performedBy, actionType, reason, block.timestamp);
    }

    /**
     * @dev Convert uint to string (helper function)
     * @param _i Integer to convert
     * @return _uintAsString String representation
     */
    function _uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Fallback function to prevent accidental Ether transfers
     */
    receive() external payable {
        revert("Contract does not accept Ether");
    }

    /**
     * @dev Fallback function for unknown function calls
     */
    fallback() external payable {
        revert("Function not found");
    }
}