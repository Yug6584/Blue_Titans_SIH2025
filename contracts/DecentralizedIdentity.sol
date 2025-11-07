// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedIdentity
 * @dev Central DID & RBAC provider for the Blue Carbon Credit Management System
 * @notice Manages decentralized identities and role-based access control
 */
contract DecentralizedIdentity is AccessControl, Pausable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant SYSTEM_ROLE = keccak256("SYSTEM_ROLE");

    struct DIDInfo {
        string name;
        string organization;
        string didURI;
        bool isVerified;
        uint256 registrationTime;
        address registeredBy;
    }

    mapping(address => DIDInfo) public dids;
    mapping(address => bool) public isDIDRegistered;
    
    address[] public registeredAddresses;
    uint256 public totalDIDs;

    event DIDRegistered(
        address indexed didAddress,
        string indexed name,
        string organization,
        string didURI,
        address indexed registeredBy
    );
    
    event DIDVerified(address indexed didAddress, address indexed verifiedBy);
    event RoleAssigned(address indexed account, bytes32 indexed role, address indexed assignedBy);
    event RoleRevoked(address indexed account, bytes32 indexed role, address indexed revokedBy);

    /**
     * @dev Constructor sets up the contract with initial admin
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNMENT_ROLE, msg.sender);
    }

    /**
     * @notice Register a new DID
     * @param name The name of the entity
     * @param organization The organization name
     * @param didURI The DID URI for off-chain metadata
     */
    function registerDID(
        string calldata name,
        string calldata organization,
        string calldata didURI
    ) external whenNotPaused nonReentrant {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(organization).length > 0, "Organization cannot be empty");
        require(bytes(didURI).length > 0, "DID URI cannot be empty");
        require(!isDIDRegistered[msg.sender], "DID already registered for this address");

        dids[msg.sender] = DIDInfo({
            name: name,
            organization: organization,
            didURI: didURI,
            isVerified: false,
            registrationTime: block.timestamp,
            registeredBy: msg.sender
        });

        isDIDRegistered[msg.sender] = true;
        registeredAddresses.push(msg.sender);
        totalDIDs++;

        emit DIDRegistered(msg.sender, name, organization, didURI, msg.sender);
    }

    /**
     * @notice Verify a DID (only by admin or government)
     * @param didAddress The address to verify
     */
    function verifyDID(address didAddress) 
        external 
        onlyRole(getRoleAdmin(GOVERNMENT_ROLE)) 
        whenNotPaused 
    {
        require(isDIDRegistered[didAddress], "DID not registered");
        require(!dids[didAddress].isVerified, "DID already verified");

        dids[didAddress].isVerified = true;
        emit DIDVerified(didAddress, msg.sender);
    }

    /**
     * @notice Assign a role to an account
     * @param account The account to assign the role to
     * @param role The role to assign
     */
    function assignRole(address account, bytes32 role) 
        external 
        onlyRole(getRoleAdmin(role)) 
        whenNotPaused 
    {
        require(isDIDRegistered[account], "Account must have registered DID");
        require(dids[account].isVerified, "DID must be verified");
        
        _grantRole(role, account);
        emit RoleAssigned(account, role, msg.sender);
    }

    /**
     * @notice Revoke a role from an account
     * @param account The account to revoke the role from
     * @param role The role to revoke
     */
    function revokeRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(getRoleAdmin(role)) 
        whenNotPaused 
    {
        _revokeRole(role, account);
        emit RoleRevoked(account, role, msg.sender);
    }

    /**
     * @notice Check if an address has a specific role
     * @param account The account to check
     * @param role The role to check for
     * @return bool True if the account has the role
     */
    function checkRole(address account, bytes32 role) external view returns (bool) {
        return hasRole(role, account);
    }

    /**
     * @notice Get DID information for an address
     * @param didAddress The address to get DID info for
     * @return DIDInfo struct containing all DID information
     */
    function getDIDInfo(address didAddress) external view returns (DIDInfo memory) {
        require(isDIDRegistered[didAddress], "DID not registered");
        return dids[didAddress];
    }

    /**
     * @notice Get all registered addresses
     * @return Array of all registered addresses
     */
    function getAllRegisteredAddresses() external view returns (address[] memory) {
        return registeredAddresses;
    }

    /**
     * @notice Pause the contract (emergency use only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Check if address is verified
     * @param account The account to check
     * @return bool True if verified
     */
    function isVerified(address account) external view returns (bool) {
        return isDIDRegistered[account] && dids[account].isVerified;
    }
}