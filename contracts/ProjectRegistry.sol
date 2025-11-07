// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DecentralizedIdentity.sol";

/**
 * @title ProjectRegistry
 * @dev Immutable project registry for Blue Carbon projects
 * @notice Registers and manages Blue Carbon projects with IPFS metadata
 */
contract ProjectRegistry is Pausable, ReentrancyGuard {
    DecentralizedIdentity public immutable identityContract;
    uint256 private _projectCounter;

    struct Project {
        string projectId;
        string metadataHash; // IPFS hash
        string location;
        string species;
        uint256 area; // in hectares
        address owner;
        bool isVerified;
        uint256 registrationTime;
        uint256 verificationTime;
        address verifiedBy;
    }

    mapping(string => Project) public projects;
    mapping(string => bool) public projectExists;
    mapping(address => string[]) public ownerProjects;
    
    string[] public allProjectIds;

    event ProjectRegistered(
        string indexed projectId,
        address indexed owner,
        string metadataHash,
        string location,
        uint256 area
    );
    
    event ProjectUpdated(
        string indexed projectId,
        string newMetadataHash,
        address indexed updatedBy
    );
    
    event ProjectVerified(
        string indexed projectId,
        address indexed verifiedBy,
        uint256 verificationTime
    );

    modifier onlyVerifiedUser() {
        require(
            identityContract.isVerified(msg.sender),
            "Only verified users can perform this action"
        );
        _;
    }

    modifier onlyVerifierOrGovernment() {
        require(
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()),
            "Only verifiers or government can perform this action"
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
     * @notice Register a new Blue Carbon project
     * @param projectId Unique identifier for the project
     * @param metadataHash IPFS hash containing project metadata
     * @param location Geographic location of the project
     * @param species Species involved in the project
     * @param area Area of the project in hectares
     */
    function registerProject(
        string calldata projectId,
        string calldata metadataHash,
        string calldata location,
        string calldata species,
        uint256 area
    ) external onlyVerifiedUser whenNotPaused nonReentrant {
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(species).length > 0, "Species cannot be empty");
        require(area > 0, "Area must be greater than zero");
        require(!projectExists[projectId], "Project already exists");

        projects[projectId] = Project({
            projectId: projectId,
            metadataHash: metadataHash,
            location: location,
            species: species,
            area: area,
            owner: msg.sender,
            isVerified: false,
            registrationTime: block.timestamp,
            verificationTime: 0,
            verifiedBy: address(0)
        });

        projectExists[projectId] = true;
        ownerProjects[msg.sender].push(projectId);
        allProjectIds.push(projectId);
        _projectCounter++;

        emit ProjectRegistered(projectId, msg.sender, metadataHash, location, area);
    }

    /**
     * @notice Update project metadata (append new version)
     * @param projectId The project to update
     * @param newMetadataHash New IPFS hash with updated metadata
     */
    function updateProjectMetadata(
        string calldata projectId,
        string calldata newMetadataHash
    ) external whenNotPaused nonReentrant {
        require(projectExists[projectId], "Project does not exist");
        require(
            projects[projectId].owner == msg.sender ||
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.GOVERNMENT_ROLE()),
            "Not authorized to update this project"
        );
        require(bytes(newMetadataHash).length > 0, "Metadata hash cannot be empty");

        projects[projectId].metadataHash = newMetadataHash;
        
        emit ProjectUpdated(projectId, newMetadataHash, msg.sender);
    }

    /**
     * @notice Mark a project as verified
     * @param projectId The project to verify
     */
    function markVerified(string calldata projectId) 
        external 
        onlyVerifierOrGovernment 
        whenNotPaused 
    {
        require(projectExists[projectId], "Project does not exist");
        require(!projects[projectId].isVerified, "Project already verified");

        projects[projectId].isVerified = true;
        projects[projectId].verificationTime = block.timestamp;
        projects[projectId].verifiedBy = msg.sender;

        emit ProjectVerified(projectId, msg.sender, block.timestamp);
    }

    /**
     * @notice Get project information
     * @param projectId The project ID to query
     * @return Project struct containing all project information
     */
    function getProject(string calldata projectId) external view returns (Project memory) {
        require(projectExists[projectId], "Project does not exist");
        return projects[projectId];
    }

    /**
     * @notice Get all projects owned by an address
     * @param owner The owner address
     * @return Array of project IDs owned by the address
     */
    function getProjectsByOwner(address owner) external view returns (string[] memory) {
        return ownerProjects[owner];
    }

    /**
     * @notice Get all registered project IDs
     * @return Array of all project IDs
     */
    function getAllProjectIds() external view returns (string[] memory) {
        return allProjectIds;
    }

    /**
     * @notice Get total number of registered projects
     * @return Total count of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return _projectCounter;
    }

    /**
     * @notice Check if a project is verified
     * @param projectId The project ID to check
     * @return bool True if project is verified
     */
    function isProjectVerified(string calldata projectId) external view returns (bool) {
        require(projectExists[projectId], "Project does not exist");
        return projects[projectId].isVerified;
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