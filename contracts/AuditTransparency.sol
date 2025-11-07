// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "./DecentralizedIdentity.sol";

/**
 * @title AuditTransparency
 * @dev Immutable audit log for the Blue Carbon Credit Management System
 * @notice Records all system events for transparency and auditability
 */
contract AuditTransparency is Pausable {
    DecentralizedIdentity public immutable identityContract;
    uint256 private _eventCounter;

    enum ActionType {
        PROJECT_REGISTERED,
        PROJECT_VERIFIED,
        CREDIT_MINTED,
        CREDIT_TRANSFERRED,
        CREDIT_RETIRED,
        VERIFICATION_REQUESTED,
        VERIFICATION_APPROVED,
        VERIFICATION_REJECTED,
        REWARD_DISTRIBUTED,
        FUNDS_DEPOSITED,
        FUNDS_WITHDRAWN,
        GOVERNANCE_ACTION,
        ANOMALY_FLAGGED,
        BRIDGE_RETIREMENT,
        SYSTEM_UPDATE
    }

    struct AuditEvent {
        uint256 eventId;
        string projectId;
        ActionType actionType;
        address actor;
        uint256 amount;
        string referenceHash; // IPFS hash or transaction reference
        uint256 timestamp;
        string description;
    }

    mapping(uint256 => AuditEvent) public events;
    mapping(string => uint256[]) public projectEvents;
    mapping(address => uint256[]) public actorEvents;
    mapping(ActionType => uint256[]) public actionTypeEvents;

    uint256[] public allEventIds;

    event AuditLogged(
        uint256 indexed eventId,
        string indexed projectId,
        ActionType indexed actionType,
        address actor,
        uint256 amount,
        string referenceHash
    );

    modifier onlyAuthorized() {
        require(
            identityContract.checkRole(msg.sender, identityContract.SYSTEM_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()),
            "Not authorized to record events"
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
     */
    constructor(address _identityContract) {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        identityContract = DecentralizedIdentity(_identityContract);
    }

    /**
     * @notice Record an audit event
     * @param projectId The project ID related to the event
     * @param actionType The type of action being recorded
     * @param amount Amount involved in the action (if applicable)
     * @param referenceHash IPFS hash or reference for additional data
     * @param description Human-readable description of the event
     */
    function recordEvent(
        string calldata projectId,
        ActionType actionType,
        uint256 amount,
        string calldata referenceHash,
        string calldata description
    ) external onlyAuthorized whenNotPaused returns (uint256) {
        _eventCounter++;
        uint256 eventId = _eventCounter;

        events[eventId] = AuditEvent({
            eventId: eventId,
            projectId: projectId,
            actionType: actionType,
            actor: msg.sender,
            amount: amount,
            referenceHash: referenceHash,
            timestamp: block.timestamp,
            description: description
        });

        // Index the event
        allEventIds.push(eventId);
        if (bytes(projectId).length > 0) {
            projectEvents[projectId].push(eventId);
        }
        actorEvents[msg.sender].push(eventId);
        actionTypeEvents[actionType].push(eventId);

        emit AuditLogged(eventId, projectId, actionType, msg.sender, amount, referenceHash);
        
        return eventId;
    }

    /**
     * @notice Get a specific audit event
     * @param eventId The event ID to retrieve
     * @return AuditEvent struct containing event details
     */
    function getEvent(uint256 eventId) external view returns (AuditEvent memory) {
        require(eventId > 0 && eventId <= _eventCounter, "Event does not exist");
        return events[eventId];
    }

    /**
     * @notice Get all events for a specific project
     * @param projectId The project ID to query
     * @return Array of event IDs for the project
     */
    function getEventsByProject(string calldata projectId) external view returns (uint256[] memory) {
        return projectEvents[projectId];
    }

    /**
     * @notice Get all events by a specific actor
     * @param actor The actor address to query
     * @return Array of event IDs for the actor
     */
    function getEventsByActor(address actor) external view returns (uint256[] memory) {
        return actorEvents[actor];
    }

    /**
     * @notice Get all events of a specific action type
     * @param actionType The action type to query
     * @return Array of event IDs for the action type
     */
    function getEventsByActionType(ActionType actionType) external view returns (uint256[] memory) {
        return actionTypeEvents[actionType];
    }

    /**
     * @notice Get all event IDs
     * @return Array of all event IDs
     */
    function getAllEventIds() external view returns (uint256[] memory) {
        return allEventIds;
    }

    /**
     * @notice Get total number of events
     * @return Total count of events
     */
    function getTotalEvents() external view returns (uint256) {
        return _eventCounter;
    }

    /**
     * @notice Get events in a specific time range
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @return Array of event IDs in the time range
     */
    function getEventsByTimeRange(
        uint256 startTime, 
        uint256 endTime
    ) external view returns (uint256[] memory) {
        require(startTime <= endTime, "Invalid time range");
        
        uint256[] memory tempEvents = new uint256[](allEventIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allEventIds.length; i++) {
            uint256 eventId = allEventIds[i];
            if (events[eventId].timestamp >= startTime && events[eventId].timestamp <= endTime) {
                tempEvents[count] = eventId;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempEvents[i];
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