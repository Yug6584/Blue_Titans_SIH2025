const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Blue Carbon Credit Management System...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy mock stablecoin for testing
  console.log("\n1. Deploying MockStablecoin...");
  const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
  const stablecoin = await MockStablecoin.deploy(
    "USD Coin",
    "USDC",
    18,
    ethers.parseEther("1000000") // 1M tokens initial supply
  );
  await stablecoin.waitForDeployment();
  console.log("MockStablecoin deployed to:", await stablecoin.getAddress());

  // Deploy DecentralizedIdentity
  console.log("\n2. Deploying DecentralizedIdentity...");
  const DecentralizedIdentity = await ethers.getContractFactory("DecentralizedIdentity");
  const identity = await DecentralizedIdentity.deploy();
  await identity.waitForDeployment();
  console.log("DecentralizedIdentity deployed to:", await identity.getAddress());

  // Deploy AuditTransparency
  console.log("\n3. Deploying AuditTransparency...");
  const AuditTransparency = await ethers.getContractFactory("AuditTransparency");
  const audit = await AuditTransparency.deploy(await identity.getAddress());
  await audit.waitForDeployment();
  console.log("AuditTransparency deployed to:", await audit.getAddress());

  // Deploy ProjectRegistry
  console.log("\n4. Deploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const registry = await ProjectRegistry.deploy(await identity.getAddress());
  await registry.waitForDeployment();
  console.log("ProjectRegistry deployed to:", await registry.getAddress());

  // Deploy CarbonCreditToken
  console.log("\n5. Deploying CarbonCreditToken...");
  const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
  const creditToken = await CarbonCreditToken.deploy(
    await identity.getAddress(),
    await audit.getAddress()
  );
  await creditToken.waitForDeployment();
  console.log("CarbonCreditToken deployed to:", await creditToken.getAddress());

  // Deploy IncentiveDistributor
  console.log("\n6. Deploying IncentiveDistributor...");
  const IncentiveDistributor = await ethers.getContractFactory("IncentiveDistributor");
  const incentives = await IncentiveDistributor.deploy(
    await identity.getAddress(),
    await audit.getAddress(),
    await stablecoin.getAddress()
  );
  await incentives.waitForDeployment();
  console.log("IncentiveDistributor deployed to:", await incentives.getAddress());

  // Deploy VerificationManager
  console.log("\n7. Deploying VerificationManager...");
  const VerificationManager = await ethers.getContractFactory("VerificationManager");
  const verification = await VerificationManager.deploy(
    await identity.getAddress(),
    await registry.getAddress(),
    await audit.getAddress(),
    await creditToken.getAddress(),
    await incentives.getAddress()
  );
  await verification.waitForDeployment();
  console.log("VerificationManager deployed to:", await verification.getAddress());

  // Deploy CarbonMarketBridge
  console.log("\n8. Deploying CarbonMarketBridge...");
  const CarbonMarketBridge = await ethers.getContractFactory("CarbonMarketBridge");
  const bridge = await CarbonMarketBridge.deploy(
    await identity.getAddress(),
    await audit.getAddress(),
    await creditToken.getAddress()
  );
  await bridge.waitForDeployment();
  console.log("CarbonMarketBridge deployed to:", await bridge.getAddress());

  // Deploy GovernanceAuditLog
  console.log("\n9. Deploying GovernanceAuditLog...");
  const GovernanceAuditLog = await ethers.getContractFactory("GovernanceAuditLog");
  const governance = await GovernanceAuditLog.deploy(
    await identity.getAddress(),
    await audit.getAddress()
  );
  await governance.waitForDeployment();
  console.log("GovernanceAuditLog deployed to:", await governance.getAddress());

  // Deploy MockExternalRegistry for testing
  console.log("\n10. Deploying MockExternalRegistry...");
  const MockExternalRegistry = await ethers.getContractFactory("MockExternalRegistry");
  const mockRegistry = await MockExternalRegistry.deploy();
  await mockRegistry.waitForDeployment();
  console.log("MockExternalRegistry deployed to:", await mockRegistry.getAddress());

  // Setup roles and permissions
  console.log("\n11. Setting up roles and permissions...");
  
  // Grant SYSTEM_ROLE to VerificationManager for minting credits
  const SYSTEM_ROLE = await identity.SYSTEM_ROLE();
  await identity.grantRole(SYSTEM_ROLE, await verification.getAddress());
  console.log("Granted SYSTEM_ROLE to VerificationManager");

  // Grant SYSTEM_ROLE to AuditTransparency for recording events
  await identity.grantRole(SYSTEM_ROLE, await audit.getAddress());
  console.log("Granted SYSTEM_ROLE to AuditTransparency");

  // Fund the IncentiveDistributor with some stablecoins
  console.log("\n12. Funding IncentiveDistributor...");
  const fundAmount = ethers.parseEther("10000"); // 10,000 tokens
  await stablecoin.transfer(await incentives.getAddress(), fundAmount);
  console.log("Transferred", ethers.formatEther(fundAmount), "tokens to IncentiveDistributor");

  // Register a mock external registry in the bridge
  console.log("\n13. Registering mock external registry...");
  await bridge.registerRegistry(
    "Verra Registry",
    await mockRegistry.getAddress(),
    "Mock Verra Registry for testing"
  );
  console.log("Registered Verra Registry in CarbonMarketBridge");

  console.log("\n=== Deployment Summary ===");
  console.log("MockStablecoin:", await stablecoin.getAddress());
  console.log("DecentralizedIdentity:", await identity.getAddress());
  console.log("AuditTransparency:", await audit.getAddress());
  console.log("ProjectRegistry:", await registry.getAddress());
  console.log("CarbonCreditToken:", await creditToken.getAddress());
  console.log("IncentiveDistributor:", await incentives.getAddress());
  console.log("VerificationManager:", await verification.getAddress());
  console.log("CarbonMarketBridge:", await bridge.getAddress());
  console.log("GovernanceAuditLog:", await governance.getAddress());
  console.log("MockExternalRegistry:", await mockRegistry.getAddress());

  console.log("\n=== Next Steps ===");
  console.log("1. Register DIDs for users using DecentralizedIdentity.registerDID()");
  console.log("2. Verify DIDs using DecentralizedIdentity.verifyDID()");
  console.log("3. Assign roles using DecentralizedIdentity.assignRole()");
  console.log("4. Register projects using ProjectRegistry.registerProject()");
  console.log("5. Submit verification requests using VerificationManager.submitVerificationRequest()");
  console.log("6. Approve verifications using VerificationManager.approveVerification()");
  console.log("7. Retire credits using CarbonMarketBridge.retireCreditsOnBridge()");

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MockStablecoin: await stablecoin.getAddress(),
      DecentralizedIdentity: await identity.getAddress(),
      AuditTransparency: await audit.getAddress(),
      ProjectRegistry: await registry.getAddress(),
      CarbonCreditToken: await creditToken.getAddress(),
      IncentiveDistributor: await incentives.getAddress(),
      VerificationManager: await verification.getAddress(),
      CarbonMarketBridge: await bridge.getAddress(),
      GovernanceAuditLog: await governance.getAddress(),
      MockExternalRegistry: await mockRegistry.getAddress()
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });