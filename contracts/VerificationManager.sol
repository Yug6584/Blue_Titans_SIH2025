// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DecentralizedIdentity.sol";
import "./ProjectRegistry.sol";
import "./AuditTransparency.sol";
import "./CarbonCreditToken.sol";
import "./IncentiveDistributor.sol";

/**
 * @title VerificationManager
 * @dev MRV (Monitoring, Reporting, Verification) workflow manager
 * @notice Manages the verification process for Blue Carbon projects
 */
contract VerificationManager is Pausable, ReentrancyGuard {
    DecentralizedIdentity public immutable identityContract;
    ProjectRegistry public immutable projectRegistry;
    AuditTransparency public immutable auditContract;
    CarbonCreditToken public immutable creditToken;
    IncentiveDistributor public immutable incentiveDistributor;

    uint256 private _verificationCounter;

    enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED
    }

    struct VerificationRequest {
        uint256 requestId;
        string projectId;
        string mrvDataHash; // IPFS hash containing MRV data
        address requester;
        uint256 requestTime;
        uint256 carbonAmount; // Amount of carbon credits to mint (in tons)
        VerificationStatus status;
        address verifier;
        uint256 verificationTime;
        string verificationNotes;
        uint256 expiryTime;
    }

    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(string => uint256[]) public projectVerifications;
    mapping(address => uint256[]) public requesterVerifications;
    mapping(address => uint256[]) public verifierVerifications;

    uint256[] public allRequestIds;
    uint256 public constant VERIFICATION_EXPIRY_PERIOD = 30 days;

    event VerificationRequested(
        uint256 indexed requestId,
        string indexed projectId,
        address indexed requester,
        string mrvDataHash,
        uint256 carbonAmount
    );

    event VerificationApproved(
        uint256 indexed requestId,
        string indexed projectId,
        address indexed verifier,
        uint256 carbonAmount,
        string verificationNotes
    );

    event VerificationRejected(
        uint256 indexed requestId,
        string indexed projectId,
        address indexed verifier,
        string verificationNotes
    );

    event VerificationExpired(
        uint256 indexed requestId,
        string indexed projectId
    );

    modifier onlyVerifiedUser() {
        require(
            identityContract.isVerified(msg.sender),
            "Only verified users can perform this action"
        );
        _;
    }

    modifier onlyVerifier() {
        require(
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()),
            "Only verifiers can perform this action"
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
     * @param _projectRegistry Address of the ProjectRegistry contract
     * @param _auditContract Address of the AuditTransparency contract
     * @param _creditToken Address of the CarbonCreditToken contract
     * @param _incentiveDistributor Address of the IncentiveDistributor contract
     */
    constructor(
        address _identityContract,
        address _projectRegistry,
        address _auditContract,
        address _creditToken,
        address _incentiveDistributor
    ) {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        require(_projectRegistry != address(0), "Project registry cannot be zero address");
        require(_auditContract != address(0), "Audit contract cannot be zero address");
        require(_creditToken != address(0), "Credit token cannot be zero address");
        require(_incentiveDistributor != address(0), "Incentive distributor cannot be zero address");

        identityContract = DecentralizedIdentity(_identityContract);
        projectRegistry = ProjectRegistry(_projectRegistry);
        auditContract = AuditTransparency(_auditContract);
        creditToken = CarbonCreditToken(_creditToken);
        incentiveDistributor = IncentiveDistributor(_incentiveDistributor);
    }

    /**
     * @notice Submit MRV data for verification
     * @param projectId The project ID to verify
     * @param mrvDataHash IPFS hash containing MRV data
     * @param carbonAmount Amount of carbon credits to request (in tons)
     * @return requestId The ID of the verification request
     */
    function submitVerificationRequest(
        string calldata projectId,
        string calldata mrvDataHash,
        uint256 carbonAmount
    ) external onlyVerifiedUser whenNotPaused nonReentrant returns (uint256) {
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(mrvDataHash).length > 0, "MRV data hash cannot be empty");
        require(carbonAmount > 0, "Carbon amount must be greater than zero");
        require(projectRegistry.projectExists(projectId), "Project does not exist");

        // Check if requester is project owner or has permission
        ProjectRegistry.Project memory project = projectRegistry.getProject(projectId);
        require(
            project.owner == msg.sender ||
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()),
            "Not authorized to request verification for this project"
        );

        _verificationCounter++;
        uint256 requestId = _verificationCounter;

        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            projectId: projectId,
            mrvDataHash: mrvDataHash,
            requester: msg.sender,
            requestTime: block.timestamp,
            carbonAmount: carbonAmount,
            status: VerificationStatus.PENDING,
            verifier: address(0),
            verificationTime: 0,
            verificationNotes: "",
            expiryTime: block.timestamp + VERIFICATION_EXPIRY_PERIOD
        });

        // Index the request
        allRequestIds.push(requestId);
        projectVerifications[projectId].push(requestId);
        requesterVerifications[msg.sender].push(requestId);

        // Record audit event
        auditContract.recordEvent(
            projectId,
            AuditTransparency.ActionType.VERIFICATION_REQUESTED,
            carbonAmount,
            mrvDataHash,
            "Verification request submitted"
        );

        emit VerificationRequested(requestId, projectId, msg.sender, mrvDataHash, carbonAmount);
        
        return requestId;
    }

    /**
     * @notice Approve a verification request
     * @param requestId The verification request ID
     * @param verificationNotes Notes from the verifier
     */
    function approveVerification(
        uint256 requestId,
        string calldata verificationNotes
    ) external onlyVerifier whenNotPaused nonReentrant {
        require(requestId > 0 && requestId <= _verificationCounter, "Invalid request ID");
        
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == VerificationStatus.PENDING, "Request is not pending");
        require(block.timestamp <= request.expiryTime, "Request has expired");

        // Update request status
        request.status = VerificationStatus.APPROVED;
        request.verifier = msg.sender;
        request.verificationTime = block.timestamp;
        request.verificationNotes = verificationNotes;

        // Index verifier
        verifierVerifications[msg.sender].push(requestId);

        // Mark project as verified in registry
        projectRegistry.markVerified(request.projectId);

        // Record audit event
        auditContract.recordEvent(
            request.projectId,
            AuditTransparency.ActionType.VERIFICATION_APPROVED,
            request.carbonAmount,
            request.mrvDataHash,
            verificationNotes
        );

        // Mint carbon credits
        ProjectRegistry.Project memory project = projectRegistry.getProject(request.projectId);
        for (uint256 i = 0; i < request.carbonAmount; i++) {
            creditToken.mintCredit(project.owner, request.projectId, request.mrvDataHash);
        }

        // Trigger reward distribution
        incentiveDistributor.triggerReward(project.owner, request.carbonAmount, request.projectId);

        emit VerificationApproved(
            requestId, 
            request.projectId, 
            msg.sender, 
            request.carbonAmount, 
            verificationNotes
        );
    }

    /**
     * @notice Reject a verification request
     * @param requestId The verification request ID
     * @param verificationNotes Reason for rejection
     */
    function rejectVerification(
        uint256 requestId,
        string calldata verificationNotes
    ) external onlyVerifier whenNotPaused nonReentrant {
        require(requestId > 0 && requestId <= _verificationCounter, "Invalid request ID");
        require(bytes(verificationNotes).length > 0, "Verification notes cannot be empty");
        
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == VerificationStatus.PENDING, "Request is not pending");

        // Update request status
        request.status = VerificationStatus.REJECTED;
        request.verifier = msg.sender;
        request.verificationTime = block.timestamp;
        request.verificationNotes = verificationNotes;

        // Index verifier
        verifierVerifications[msg.sender].push(requestId);

        // Record audit event
        auditContract.recordEvent(
            request.projectId,
            AuditTransparency.ActionType.VERIFICATION_REJECTED,
            request.carbonAmount,
            request.mrvDataHash,
            verificationNotes
        );

        emit VerificationRejected(requestId, request.projectId, msg.sender, verificationNotes);
    }

    /**
     * @notice Mark expired verification requests
     * @param requestId The verification request ID to mark as expired
     */
    function markExpired(uint256 requestId) external whenNotPaused {
        require(requestId > 0 && requestId <= _verificationCounter, "Invalid request ID");
        
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == VerificationStatus.PENDING, "Request is not pending");
        require(block.timestamp > request.expiryTime, "Request has not expired yet");

        request.status = VerificationStatus.EXPIRED;

        emit VerificationExpired(requestId, request.projectId);
    }

    /**
     * @notice Get verification request details
     * @param requestId The request ID to query
     * @return VerificationRequest struct containing request details
     */
    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        require(requestId > 0 && requestId <= _verificationCounter, "Invalid request ID");
        return verificationRequests[requestId];
    }

    /**
     * @notice Get all verification requests for a project
     * @param projectId The project ID to query
     * @return Array of request IDs for the project
     */
    function getVerificationsByProject(string calldata projectId) external view returns (uint256[] memory) {
        return projectVerifications[projectId];
    }

    /**
     * @notice Get all verification requests by a requester
     * @param requester The requester address
     * @return Array of request IDs by the requester
     */
    function getVerificationsByRequester(address requester) external view returns (uint256[] memory) {
        return requesterVerifications[requester];
    }

    /**
     * @notice Get all verifications handled by a verifier
     * @param verifier The verifier address
     * @return Array of request IDs handled by the verifier
     */
    function getVerificationsByVerifier(address verifier) external view returns (uint256[] memory) {
        return verifierVerifications[verifier];
    }

    /**
     * @notice Get all verification request IDs
     * @return Array of all request IDs
     */
    function getAllRequestIds() external view returns (uint256[] memory) {
        return allRequestIds;
    }

    /**
     * @notice Get total number of verification requests
     * @return Total count of requests
     */
    function getTotalRequests() external view returns (uint256) {
        return _verificationCounter;
    }

    /**
     * @notice Get pending verification requests
     * @return Array of pending request IDs
     */
    function getPendingRequests() external view returns (uint256[] memory) {
        uint256[] memory tempRequests = new uint256[](allRequestIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allRequestIds.length; i++) {
            uint256 requestId = allRequestIds[i];
            if (verificationRequests[requestId].status == VerificationStatus.PENDING &&
                block.timestamp <= verificationRequests[requestId].expiryTime) {
                tempRequests[count] = requestId;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempRequests[i];
        }
        
        return result;
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