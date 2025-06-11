// Mock Web3 integration for MVP
// This will be replaced with actual Ethers.js implementation
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var MockWeb3Provider = /** @class */ (function () {
    function MockWeb3Provider() {
        this.isConnected = false;
        this.account = null;
    }
    MockWeb3Provider.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Simulate wallet connection
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            _this.isConnected = true;
                            _this.account = "0x1234567890123456789012345678901234567890";
                            resolve();
                        }, 1000);
                    })];
            });
        });
    };
    MockWeb3Provider.prototype.disconnect = function () {
        this.isConnected = false;
        this.account = null;
    };
    MockWeb3Provider.prototype.addEntry = function (date, actions, description) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate blockchain transaction
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            var txHash = "0x" + Math.random().toString(16).substring(2, 66);
                            resolve(txHash);
                        }, 2000);
                    })];
            });
        });
    };
    return MockWeb3Provider;
}());
export var web3Provider = new MockWeb3Provider();
// Environment variable fallback for API endpoints
export var getApiUrl = function () {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
};
// Web3 contract address (placeholder)
export var CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";
// Network configuration
export var NETWORK_CONFIG = {
    chainId: import.meta.env.VITE_CHAIN_ID || "0x5", // Goerli testnet
    networkName: "Goerli Test Network",
    rpcUrl: import.meta.env.VITE_RPC_URL || "https://goerli.infura.io/v3/YOUR_PROJECT_ID"
};
