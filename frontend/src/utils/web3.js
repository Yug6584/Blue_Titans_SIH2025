import { ethers } from 'ethers';

// Contract addresses (will be loaded from deployment info)
const CONTRACT_ADDRESSES = {
  DecentralizedIdentity: '',
  ProjectRegistry: '',
  CarbonCreditToken: '',
  VerificationManager: '',
  IncentiveDistributor: '',
  CarbonMarketBridge: '',
  GovernanceAuditLog: '',
  AuditTransparency: '',
  MockStablecoin: ''
};

// Simplified ABIs for frontend interaction
const CONTRACT_ABIS = {
  CarbonCreditToken: [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getCreditsByOwner(address owner) view returns (uint256[])",
    "function getCreditInfo(uint256 tokenId) view returns (tuple(string projectId, string metadataHash, uint256 mintTime, address minter, bool isRetired, uint256 retireTime, address retiredBy, string retirementReason))",
    "function retireCredit(uint256 tokenId, string reason)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event CreditRetired(uint256 indexed tokenId, address indexed retiredBy, string reason, uint256 retireTime)"
  ],
  
  ProjectRegistry: [
    "function getAllProjectIds() view returns (string[])",
    "function getProject(string projectId) view returns (tuple(string projectId, string metadataHash, string location, string species, uint256 area, address owner, bool isVerified, uint256 registrationTime, uint256 verificationTime, address verifiedBy))",
    "function registerProject(string projectId, string metadataHash, string location, string species, uint256 area)",
    "function getTotalProjects() view returns (uint256)",
    "event ProjectRegistered(string indexed projectId, address indexed owner, string metadataHash, string location, uint256 area)"
  ],
  
  VerificationManager: [
    "function submitVerificationRequest(string projectId, string mrvDataHash, uint256 carbonAmount) returns (uint256)",
    "function approveVerification(uint256 requestId, string verificationNotes)",
    "function getVerificationRequest(uint256 requestId) view returns (tuple(uint256 requestId, string projectId, string mrvDataHash, address requester, uint256 requestTime, uint256 carbonAmount, uint8 status, address verifier, uint256 verificationTime, string verificationNotes, uint256 expiryTime))",
    "function getPendingRequests() view returns (uint256[])",
    "event VerificationRequested(uint256 indexed requestId, string indexed projectId, address indexed requester, string mrvDataHash, uint256 carbonAmount)",
    "event VerificationApproved(uint256 indexed requestId, string indexed projectId, address indexed verifier, uint256 carbonAmount, string verificationNotes)"
  ]
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.account = null;
  }

  // Initialize Web3 connection
  async init() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.loadContractAddresses();
        return true;
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        return false;
      }
    } else {
      console.error('MetaMask not detected');
      return false;
    }
  }

  // Connect wallet
  async connectWallet() {
    try {
      if (!this.provider) {
        throw new Error('Web3 not initialized');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.account = accounts[0];
      this.signer = this.provider.getSigner();
      
      // Initialize contracts
      await this.initializeContracts();
      
      return {
        account: this.account,
        balance: await this.getBalance(),
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Get account balance
  async getBalance() {
    if (!this.account || !this.provider) return '0';
    
    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // Load contract addresses from deployment info
  async loadContractAddresses() {
    try {
      const response = await fetch('/deployment-info.json');
      const deploymentInfo = await response.json();
      
      Object.keys(CONTRACT_ADDRESSES).forEach(contractName => {
        if (deploymentInfo.contracts[contractName]) {
          CONTRACT_ADDRESSES[contractName] = deploymentInfo.contracts[contractName];
        }
      });
      
      console.log('Contract addresses loaded:', CONTRACT_ADDRESSES);
    } catch (error) {
      console.error('Failed to load contract addresses:', error);
      // Use fallback addresses for development
      this.setFallbackAddresses();
    }
  }

  // Set fallback addresses for development
  setFallbackAddresses() {
    CONTRACT_ADDRESSES.DecentralizedIdentity = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    CONTRACT_ADDRESSES.ProjectRegistry = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    CONTRACT_ADDRESSES.CarbonCreditToken = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    CONTRACT_ADDRESSES.VerificationManager = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
    CONTRACT_ADDRESSES.IncentiveDistributor = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
    CONTRACT_ADDRESSES.CarbonMarketBridge = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
    CONTRACT_ADDRESSES.GovernanceAuditLog = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';
    CONTRACT_ADDRESSES.AuditTransparency = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    CONTRACT_ADDRESSES.MockStablecoin = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  }

  // Initialize contract instances
  async initializeContracts() {
    try {
      this.contracts.carbonToken = new ethers.Contract(
        CONTRACT_ADDRESSES.CarbonCreditToken,
        CONTRACT_ABIS.CarbonCreditToken,
        this.signer
      );

      this.contracts.projectRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.ProjectRegistry,
        CONTRACT_ABIS.ProjectRegistry,
        this.signer
      );

      this.contracts.verificationManager = new ethers.Contract(
        CONTRACT_ADDRESSES.VerificationManager,
        CONTRACT_ABIS.VerificationManager,
        this.signer
      );

      console.log('Contracts initialized successfully');
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  // Carbon Token Methods
  async getCarbonTokenBalance(address = null) {
    const targetAddress = address || this.account;
    if (!targetAddress || !this.contracts.carbonToken) return '0';
    
    try {
      const balance = await this.contracts.carbonToken.balanceOf(targetAddress);
      return balance.toString();
    } catch (error) {
      console.error('Failed to get carbon token balance:', error);
      return '0';
    }
  }

  async getUserCredits(address = null) {
    const targetAddress = address || this.account;
    if (!targetAddress || !this.contracts.carbonToken) return [];
    
    try {
      const tokenIds = await this.contracts.carbonToken.getCreditsByOwner(targetAddress);
      const credits = [];
      
      for (const tokenId of tokenIds) {
        const creditInfo = await this.contracts.carbonToken.getCreditInfo(tokenId);
        credits.push({
          tokenId: tokenId.toString(),
          ...creditInfo,
        });
      }
      
      return credits;
    } catch (error) {
      console.error('Failed to get user credits:', error);
      return [];
    }
  }

  async retireCredit(tokenId, reason) {
    if (!this.contracts.carbonToken) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contracts.carbonToken.retireCredit(tokenId, reason);
      return await tx.wait();
    } catch (error) {
      console.error('Failed to retire credit:', error);
      throw error;
    }
  }

  // Project Registry Methods
  async getAllProjects() {
    if (!this.contracts.projectRegistry) return [];
    
    try {
      const projectIds = await this.contracts.projectRegistry.getAllProjectIds();
      const projects = [];
      
      for (const projectId of projectIds) {
        const project = await this.contracts.projectRegistry.getProject(projectId);
        projects.push(project);
      }
      
      return projects;
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  async registerProject(projectData) {
    if (!this.contracts.projectRegistry) throw new Error('Contract not initialized');
    
    try {
      const { projectId, metadataHash, location, species, area } = projectData;
      const tx = await this.contracts.projectRegistry.registerProject(
        projectId,
        metadataHash,
        location,
        species,
        area
      );
      return await tx.wait();
    } catch (error) {
      console.error('Failed to register project:', error);
      throw error;
    }
  }

  // Verification Methods
  async submitVerificationRequest(projectId, mrvDataHash, carbonAmount) {
    if (!this.contracts.verificationManager) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contracts.verificationManager.submitVerificationRequest(
        projectId,
        mrvDataHash,
        carbonAmount
      );
      return await tx.wait();
    } catch (error) {
      console.error('Failed to submit verification request:', error);
      throw error;
    }
  }

  async getPendingVerifications() {
    if (!this.contracts.verificationManager) return [];
    
    try {
      const requestIds = await this.contracts.verificationManager.getPendingRequests();
      const requests = [];
      
      for (const requestId of requestIds) {
        const request = await this.contracts.verificationManager.getVerificationRequest(requestId);
        requests.push(request);
      }
      
      return requests;
    } catch (error) {
      console.error('Failed to get pending verifications:', error);
      return [];
    }
  }

  // Utility Methods
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  formatTokenAmount(amount, decimals = 18) {
    return ethers.utils.formatUnits(amount, decimals);
  }

  parseTokenAmount(amount, decimals = 18) {
    return ethers.utils.parseUnits(amount.toString(), decimals);
  }

  // Event listeners
  setupEventListeners() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.account = null;
          this.signer = null;
        } else {
          this.account = accounts[0];
          this.signer = this.provider.getSigner();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }
}

// Create singleton instance
const web3Service = new Web3Service();

export default web3Service;