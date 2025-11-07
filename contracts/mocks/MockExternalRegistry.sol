// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockExternalRegistry
 * @dev Mock external carbon registry for testing bridge functionality
 */
contract MockExternalRegistry {
    struct RetirementRecord {
        address company;
        uint256 amount;
        string proofHash;
        uint256 timestamp;
        bool isProcessed;
    }

    mapping(uint256 => RetirementRecord) public retirements;
    mapping(address => uint256[]) public companyRetirements;
    
    uint256 public nextRetirementId = 1;
    uint256 public totalRetired;

    event CreditRetiredOnRegistry(
        uint256 indexed retirementId,
        address indexed company,
        uint256 amount,
        string proofHash
    );

    function retireCredits(
        address company,
        uint256 amount,
        string calldata proofHash
    ) external returns (uint256) {
        require(company != address(0), "Invalid company address");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(proofHash).length > 0, "Proof hash cannot be empty");

        uint256 retirementId = nextRetirementId++;

        retirements[retirementId] = RetirementRecord({
            company: company,
            amount: amount,
            proofHash: proofHash,
            timestamp: block.timestamp,
            isProcessed: true
        });

        companyRetirements[company].push(retirementId);
        totalRetired += amount;

        emit CreditRetiredOnRegistry(retirementId, company, amount, proofHash);

        return retirementId;
    }

    function getRetirement(uint256 retirementId) external view returns (RetirementRecord memory) {
        return retirements[retirementId];
    }

    function getCompanyRetirements(address company) external view returns (uint256[] memory) {
        return companyRetirements[company];
    }
}