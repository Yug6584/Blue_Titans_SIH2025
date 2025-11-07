// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "./DecentralizedIdentity.sol";
import "./AuditTransparency.sol";

/**
 * @title GovernanceAuditLog
 * @dev Records governance and administrative actions for system transparency
 * @notice Maintains an immutable log of all governance decisions and anomalies
 */
contract GovernanceAuditLog is Pausable {
    DecentralizedIdentity public immutable identityContract;
    AuditTransparency public immutable auditContract;

    uint256 private _actionCounter;
    uint256 private _anomalyCounter;

    enum ActionType {
        ROLE_ASSIGNED,
        ROLE_REVOKED,
        USER_BANNED,
        USER_UNBANNED,
        CONTRACT_PAUSED,
        CONTRACT_UNPAUSED,
        CONFIG_UPDATED,
        EMERGENCY_ACTION,
        SYSTEM_UPGRADE,
        POLICY_CHANGE
    }

    enum AnomalyType {
        SUSPICIOUS_ACTIVITY,
        FRAUD_DETECTED,
        SYSTEM_BREACH,
        DATA_INCONSISTENCY,
        UNAUTHORIZED_ACCESS,
        PERFORMANCE_ISSUE
    }

    struct GovernanceAction {
        uint256 actionId;
        ActionType actionType;
        address actor;
        address target;
        string description;
        uint256 timestamp;
        bool isVerified;
        address verifiedBy;
        uint256 verificationTime;
        string verificationRemarks;
    }

    struct AnomalyReport {
        uint256 anomalyId;
        AnomalyType anomalyType;
        address target;
        address reporter;
        string reason;
        uint256 timestamp;
        bool isResolved;
        address resolvedBy;
        uint256 resolutionTime;
        string resolutionNotes;
    }

    mapping(uint256 => GovernanceAction) public governanceActions;
    mapping(uint256 => AnomalyReport) public anomalies;
    mapping(address => uint256[]) public userActions;
    mapping(address => uint256[]) public targetActions;
    mapping(address => uint256[]) public userAnomalies;
    mapping(ActionType => uint256[]) public actionsByType;
    mapping(AnomalyType => uint256[]) public anomaliesByType;

    uint256[] public allActionIds;
    uint256[] public allAnomalyIds;

    event ActionLogged(
        uint256 indexed actionId,
        ActionType indexed actionType,
        address indexed actor,
        address target,
        string description
    );

    event AnomalyFlagged(
        uint256 indexed anomalyId,
        AnomalyType indexed anomalyType,
        address indexed target,
        address reporter,
        string reason
    );

    event ActionVerified(
        uint256 indexed actionId,
        address indexed verifiedBy,
        bool isValid,
        string remarks
    );

    event AnomalyResolved(
        uint256 indexed anomalyId,
        address indexed resolvedBy,
        string resolutionNotes
    );

    modifier onlyAdmin() {
        require(
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Only admin can perform this action"
        );
        _;
    }

    modifier onlyGovernmentOrAdmin() {
        require(
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Only government or admin can perform this action"
        );
        _;
    }

    modifier onlyAuditor() {
        require(
            identityContract.checkRole(msg.sender, identityContract.AUDITOR_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Only auditors, government, or admin can perform this action"
        );
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
    ) {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        require(_auditContract != address(0), "Audit contract cannot be zero address");

        identityContract = DecentralizedIdentity(_identityContract);
        auditContract = AuditTransparency(_auditContract);
    }

    /**
     * @notice Log a governance action
     * @param actionType Type of action being performed
     * @param target Target address of the action (if applicable)
     * @param description Description of the action
     * @return actionId The ID of the logged action
     */
    function logAction(
        ActionType actionType,
        address target,
        string calldata description
    ) external onlyAdmin whenNotPaused returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");

        _actionCounter++;
        uint256 actionId = _actionCounter;

        governanceActions[actionId] = GovernanceAction({
            actionId: actionId,
            actionType: actionType,
            actor: msg.sender,
            target: target,
            description: description,
            timestamp: block.timestamp,
            isVerified: false,
            verifiedBy: address(0),
            verificationTime: 0,
            verificationRemarks: ""
        });

        // Index the action
        allActionIds.push(actionId);
        userActions[msg.sender].push(actionId);
        if (target != address(0)) {
            targetActions[target].push(actionId);
        }
        actionsByType[actionType].push(actionId);

        // Record in audit transparency
        auditContract.recordEvent(
            "",
            AuditTransparency.ActionType.GOVERNANCE_ACTION,
            0,
            "",
            description
        );

        emit ActionLogged(actionId, actionType, msg.sender, target, description);
        
        return actionId;
    }

    /**
     * @notice Flag an anomaly
     * @param anomalyType Type of anomaly detected
     * @param target Target address related to the anomaly
     * @param reason Reason for flagging the anomaly
     * @return anomalyId The ID of the flagged anomaly
     */
    function flagAnomaly(
        AnomalyType anomalyType,
        address target,
        string calldata reason
    ) external onlyGovernmentOrAdmin whenNotPaused returns (uint256) {
        require(target != address(0), "Target cannot be zero address");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        _anomalyCounter++;
        uint256 anomalyId = _anomalyCounter;

        anomalies[anomalyId] = AnomalyReport({
            anomalyId: anomalyId,
            anomalyType: anomalyType,
            target: target,
            reporter: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            isResolved: false,
            resolvedBy: address(0),
            resolutionTime: 0,
            resolutionNotes: ""
        });

        // Index the anomaly
        allAnomalyIds.push(anomalyId);
        userAnomalies[target].push(anomalyId);
        anomaliesByType[anomalyType].push(anomalyId);

        // Record in audit transparency
        auditContract.recordEvent(
            "",
            AuditTransparency.ActionType.ANOMALY_FLAGGED,
            0,
            "",
            string(abi.encodePacked("Anomaly flagged: ", reason))
        );

        emit AnomalyFlagged(anomalyId, anomalyType, target, msg.sender, reason);
        
        return anomalyId;
    }

    /**
     * @notice Verify a governance action
     * @param actionId The action ID to verify
     * @param isValid Whether the action is valid
     * @param remarks Verification remarks
     */
    function verifyAction(
        uint256 actionId,
        bool isValid,
        string calldata remarks
    ) external onlyAuditor whenNotPaused {
        require(actionId > 0 && actionId <= _actionCounter, "Invalid action ID");
        require(bytes(remarks).length > 0, "Remarks cannot be empty");

        GovernanceAction storage action = governanceActions[actionId];
        require(!action.isVerified, "Action already verified");

        action.isVerified = true;
        action.verifiedBy = msg.sender;
        action.verificationTime = block.timestamp;
        action.verificationRemarks = remarks;

        emit ActionVerified(actionId, msg.sender, isValid, remarks);
    }

    /**
     * @notice Resolve an anomaly
     * @param anomalyId The anomaly ID to resolve
     * @param resolutionNotes Notes about the resolution
     */
    function resolveAnomaly(
        uint256 anomalyId,
        string calldata resolutionNotes
    ) external onlyGovernmentOrAdmin whenNotPaused {
        require(anomalyId > 0 && anomalyId <= _anomalyCounter, "Invalid anomaly ID");
        require(bytes(resolutionNotes).length > 0, "Resolution notes cannot be empty");

        AnomalyReport storage anomaly = anomalies[anomalyId];
        require(!anomaly.isResolved, "Anomaly already resolved");

        anomaly.isResolved = true;
        anomaly.resolvedBy = msg.sender;
        anomaly.resolutionTime = block.timestamp;
        anomaly.resolutionNotes = resolutionNotes;

        emit AnomalyResolved(anomalyId, msg.sender, resolutionNotes);
    }

    /**
     * @notice Get governance action details
     * @param actionId The action ID to query
     * @return GovernanceAction struct containing action details
     */
    function getAction(uint256 actionId) external view returns (GovernanceAction memory) {
        require(actionId > 0 && actionId <= _actionCounter, "Invalid action ID");
        return governanceActions[actionId];
    }

    /**
     * @notice Get anomaly details
     * @param anomalyId The anomaly ID to query
     * @return AnomalyReport struct containing anomaly details
     */
    function getAnomaly(uint256 anomalyId) external view returns (AnomalyReport memory) {
        require(anomalyId > 0 && anomalyId <= _anomalyCounter, "Invalid anomaly ID");
        return anomalies[anomalyId];
    }

    /**
     * @notice Get all actions by a user
     * @param user The user address
     * @return Array of action IDs by the user
     */
    function getActionsByUser(address user) external view returns (uint256[] memory) {
        return userActions[user];
    }

    /**
     * @notice Get all actions targeting a specific address
     * @param target The target address
     * @return Array of action IDs targeting the address
     */
    function getActionsByTarget(address target) external view returns (uint256[] memory) {
        return targetActions[target];
    }

    /**
     * @notice Get all anomalies for a user
     * @param user The user address
     * @return Array of anomaly IDs for the user
     */
    function getAnomaliesByUser(address user) external view returns (uint256[] memory) {
        return userAnomalies[user];
    }

    /**
     * @notice Get all actions of a specific type
     * @param actionType The action type
     * @return Array of action IDs of the specified type
     */
    function getActionsByType(ActionType actionType) external view returns (uint256[] memory) {
        return actionsByType[actionType];
    }

    /**
     * @notice Get all anomalies of a specific type
     * @param anomalyType The anomaly type
     * @return Array of anomaly IDs of the specified type
     */
    function getAnomaliesByType(AnomalyType anomalyType) external view returns (uint256[] memory) {
        return anomaliesByType[anomalyType];
    }

    /**
     * @notice Get all action IDs
     * @return Array of all action IDs
     */
    function getAllActionIds() external view returns (uint256[] memory) {
        return allActionIds;
    }

    /**
     * @notice Get all anomaly IDs
     * @return Array of all anomaly IDs
     */
    function getAllAnomalyIds() external view returns (uint256[] memory) {
        return allAnomalyIds;
    }

    /**
     * @notice Get total number of actions
     * @return Total count of actions
     */
    function getTotalActions() external view returns (uint256) {
        return _actionCounter;
    }

    /**
     * @notice Get total number of anomalies
     * @return Total count of anomalies
     */
    function getTotalAnomalies() external view returns (uint256) {
        return _anomalyCounter;
    }

    /**
     * @notice Get unresolved anomalies
     * @return Array of unresolved anomaly IDs
     */
    function getUnresolvedAnomalies() external view returns (uint256[] memory) {
        uint256[] memory tempAnomalies = new uint256[](allAnomalyIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allAnomalyIds.length; i++) {
            uint256 anomalyId = allAnomalyIds[i];
            if (!anomalies[anomalyId].isResolved) {
                tempAnomalies[count] = anomalyId;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempAnomalies[i];
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