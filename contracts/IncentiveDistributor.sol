// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DecentralizedIdentity.sol";
import "./AuditTransparency.sol";

/**
 * @title IncentiveDistributor
 * @dev Manages stablecoin incentive payments for verified carbon projects
 * @notice Distributes rewards to project owners upon successful verification
 */
contract IncentiveDistributor is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    DecentralizedIdentity public immutable identityContract;
    AuditTransparency public immutable auditContract;
    
    IERC20 public stablecoin;
    uint256 private _rewardCounter;

    struct RewardInfo {
        uint256 rewardId;
        address recipient;
        uint256 amount;
        string projectId;
        uint256 timestamp;
        address distributedBy;
        string reason;
    }

    mapping(uint256 => RewardInfo) public rewards;
    mapping(address => uint256[]) public recipientRewards;
    mapping(string => uint256[]) public projectRewards;
    mapping(address => uint256) public totalRewardsReceived;

    uint256[] public allRewardIds;
    uint256 public totalDistributed;
    uint256 public rewardPerTon = 10 * 10**18; // 10 tokens per ton CO2 (assuming 18 decimals)

    event StablecoinUpdated(address indexed oldStablecoin, address indexed newStablecoin);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event RewardDistributed(
        uint256 indexed rewardId,
        address indexed recipient,
        uint256 amount,
        string indexed projectId,
        string reason
    );
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    modifier onlyAdmin() {
        require(
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Only admin can perform this action"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            identityContract.checkRole(msg.sender, identityContract.VERIFIER_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.SYSTEM_ROLE()) ||
            identityContract.checkRole(msg.sender, identityContract.DEFAULT_ADMIN_ROLE()),
            "Not authorized to distribute rewards"
        );
        _;
    }

    /**
     * @dev Constructor
     * @param _identityContract Address of the DecentralizedIdentity contract
     * @param _auditContract Address of the AuditTransparency contract
     * @param _stablecoin Address of the stablecoin contract (can be updated later)
     */
    constructor(
        address _identityContract,
        address _auditContract,
        address _stablecoin
    ) {
        require(_identityContract != address(0), "Identity contract cannot be zero address");
        require(_auditContract != address(0), "Audit contract cannot be zero address");
        
        identityContract = DecentralizedIdentity(_identityContract);
        auditContract = AuditTransparency(_auditContract);
        
        if (_stablecoin != address(0)) {
            stablecoin = IERC20(_stablecoin);
        }
    }

    /**
     * @notice Set the stablecoin contract address
     * @param _stablecoin Address of the stablecoin contract
     */
    function setStablecoin(address _stablecoin) external onlyAdmin {
        require(_stablecoin != address(0), "Stablecoin cannot be zero address");
        
        address oldStablecoin = address(stablecoin);
        stablecoin = IERC20(_stablecoin);
        
        emit StablecoinUpdated(oldStablecoin, _stablecoin);
    }

    /**
     * @notice Update the reward rate per ton of CO2
     * @param _rewardPerTon New reward rate (in wei)
     */
    function setRewardPerTon(uint256 _rewardPerTon) external onlyAdmin {
        require(_rewardPerTon > 0, "Reward rate must be greater than zero");
        
        uint256 oldRate = rewardPerTon;
        rewardPerTon = _rewardPerTon;
        
        emit RewardRateUpdated(oldRate, _rewardPerTon);
    }

    /**
     * @notice Deposit stablecoins into the contract
     * @param amount Amount of stablecoins to deposit
     */
    function depositTokens(uint256 amount) external whenNotPaused nonReentrant {
        require(address(stablecoin) != address(0), "Stablecoin not set");
        require(amount > 0, "Amount must be greater than zero");

        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        // Record audit event
        auditContract.recordEvent(
            "",
            AuditTransparency.ActionType.FUNDS_DEPOSITED,
            amount,
            "",
            "Funds deposited for incentive distribution"
        );

        emit FundsDeposited(msg.sender, amount);
    }

    /**
     * @notice Distribute reward to a recipient
     * @param recipient Address to receive the reward
     * @param amount Amount of stablecoins to distribute
     * @param projectId Project ID associated with the reward
     * @param reason Reason for the reward distribution
     * @return rewardId The ID of the reward record
     */
    function distributeReward(
        address recipient,
        uint256 amount,
        string calldata projectId,
        string calldata reason
    ) external onlyAuthorized whenNotPaused nonReentrant returns (uint256) {
        require(address(stablecoin) != address(0), "Stablecoin not set");
        require(recipient != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient contract balance");

        _rewardCounter++;
        uint256 rewardId = _rewardCounter;

        rewards[rewardId] = RewardInfo({
            rewardId: rewardId,
            recipient: recipient,
            amount: amount,
            projectId: projectId,
            timestamp: block.timestamp,
            distributedBy: msg.sender,
            reason: reason
        });

        // Index the reward
        allRewardIds.push(rewardId);
        recipientRewards[recipient].push(rewardId);
        projectRewards[projectId].push(rewardId);
        
        // Update totals
        totalRewardsReceived[recipient] += amount;
        totalDistributed += amount;

        // Transfer tokens
        stablecoin.safeTransfer(recipient, amount);

        // Record audit event
        auditContract.recordEvent(
            projectId,
            AuditTransparency.ActionType.REWARD_DISTRIBUTED,
            amount,
            "",
            reason
        );

        emit RewardDistributed(rewardId, recipient, amount, projectId, reason);
        
        return rewardId;
    }

    /**
     * @notice Internal function to distribute rewards
     */
    function _distributeRewardInternal(
        address recipient,
        uint256 amount,
        string memory projectId,
        string memory reason
    ) internal returns (uint256) {
        require(address(stablecoin) != address(0), "Stablecoin not set");
        require(recipient != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient contract balance");

        _rewardCounter++;
        uint256 rewardId = _rewardCounter;

        rewards[rewardId] = RewardInfo({
            rewardId: rewardId,
            recipient: recipient,
            amount: amount,
            projectId: projectId,
            timestamp: block.timestamp,
            distributedBy: msg.sender,
            reason: reason
        });

        // Index the reward
        allRewardIds.push(rewardId);
        recipientRewards[recipient].push(rewardId);
        projectRewards[projectId].push(rewardId);
        
        // Update totals
        totalRewardsReceived[recipient] += amount;
        totalDistributed += amount;

        // Transfer tokens
        stablecoin.safeTransfer(recipient, amount);

        // Record audit event
        auditContract.recordEvent(
            projectId,
            AuditTransparency.ActionType.REWARD_DISTRIBUTED,
            amount,
            "",
            reason
        );

        emit RewardDistributed(rewardId, recipient, amount, projectId, reason);
        
        return rewardId;
    }

    /**
     * @notice Trigger reward distribution (called by VerificationManager)
     * @param recipient Address to receive the reward
     * @param carbonAmount Amount of carbon credits (in tons)
     * @param projectId Project ID associated with the reward
     */
    function triggerReward(
        address recipient,
        uint256 carbonAmount,
        string calldata projectId
    ) external onlyAuthorized whenNotPaused {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(carbonAmount > 0, "Carbon amount must be greater than zero");
        
        uint256 rewardAmount = carbonAmount * rewardPerTon;
        
        if (address(stablecoin) != address(0) && 
            stablecoin.balanceOf(address(this)) >= rewardAmount) {
            
            _distributeRewardInternal(
                recipient,
                rewardAmount,
                projectId,
                "Verification reward for carbon credit generation"
            );
        }
    }

    /**
     * @notice Withdraw funds from the contract (emergency use)
     * @param recipient Address to receive the funds
     * @param amount Amount to withdraw
     */
    function withdrawFunds(
        address recipient,
        uint256 amount
    ) external onlyAdmin nonReentrant {
        require(address(stablecoin) != address(0), "Stablecoin not set");
        require(recipient != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient contract balance");

        stablecoin.safeTransfer(recipient, amount);

        // Record audit event
        auditContract.recordEvent(
            "",
            AuditTransparency.ActionType.FUNDS_WITHDRAWN,
            amount,
            "",
            "Emergency funds withdrawal"
        );

        emit FundsWithdrawn(recipient, amount);
    }

    /**
     * @notice Get reward information
     * @param rewardId The reward ID to query
     * @return RewardInfo struct containing reward details
     */
    function getReward(uint256 rewardId) external view returns (RewardInfo memory) {
        require(rewardId > 0 && rewardId <= _rewardCounter, "Invalid reward ID");
        return rewards[rewardId];
    }

    /**
     * @notice Get all rewards for a recipient
     * @param recipient The recipient address
     * @return Array of reward IDs for the recipient
     */
    function getRewardsByRecipient(address recipient) external view returns (uint256[] memory) {
        return recipientRewards[recipient];
    }

    /**
     * @notice Get all rewards for a project
     * @param projectId The project ID
     * @return Array of reward IDs for the project
     */
    function getRewardsByProject(string calldata projectId) external view returns (uint256[] memory) {
        return projectRewards[projectId];
    }

    /**
     * @notice Get all reward IDs
     * @return Array of all reward IDs
     */
    function getAllRewardIds() external view returns (uint256[] memory) {
        return allRewardIds;
    }

    /**
     * @notice Get total number of rewards distributed
     * @return Total count of rewards
     */
    function getTotalRewards() external view returns (uint256) {
        return _rewardCounter;
    }

    /**
     * @notice Get contract balance
     * @return Current stablecoin balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        if (address(stablecoin) == address(0)) {
            return 0;
        }
        return stablecoin.balanceOf(address(this));
    }

    /**
     * @notice Get total rewards received by an address
     * @param recipient The recipient address
     * @return Total amount of rewards received
     */
    function getTotalRewardsReceived(address recipient) external view returns (uint256) {
        return totalRewardsReceived[recipient];
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