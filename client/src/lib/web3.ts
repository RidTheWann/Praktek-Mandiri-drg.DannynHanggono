// Mock Web3 integration for MVP
// This will be replaced with actual Ethers.js implementation

export interface Web3Provider {
  isConnected: boolean;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  addEntry: (date: string, actions: string[], description: string) => Promise<string>;
}

class MockWeb3Provider implements Web3Provider {
  isConnected = false;
  account: string | null = null;

  async connect(): Promise<void> {
    // Simulate wallet connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.account = "0x1234567890123456789012345678901234567890";
        resolve();
      }, 1000);
    });
  }

  disconnect(): void {
    this.isConnected = false;
    this.account = null;
  }

  async addEntry(date: string, actions: string[], description: string): Promise<string> {
    // Simulate blockchain transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = "0x" + Math.random().toString(16).substring(2, 66);
        resolve(txHash);
      }, 2000);
    });
  }
}

export const web3Provider = new MockWeb3Provider();

// Environment variable fallback for API endpoints
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5000";
};

// Web3 contract address (placeholder)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";

// Network configuration
export const NETWORK_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || "0x5", // Goerli testnet
  networkName: "Goerli Test Network",
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://goerli.infura.io/v3/YOUR_PROJECT_ID"
};
