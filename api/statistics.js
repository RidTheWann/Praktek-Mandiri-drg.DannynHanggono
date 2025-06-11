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
import { storage } from './storage.js';
export default function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, statistics_1, uniqueDays, dailyAverage, trafficData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (req.method !== "GET") {
                        return [2 /*return*/, res.status(405).json({ error: "Method Not Allowed" })];
                    }
                    return [4 /*yield*/, storage.getDataEntries()];
                case 1:
                    entries = _a.sent();
                    statistics_1 = {
                        gender: {
                            male: entries.filter(function (e) { var _a; return ((_a = e.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "laki-laki"; }).length,
                            female: entries.filter(function (e) { var _a; return ((_a = e.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "perempuan"; }).length
                        },
                        total: entries.length,
                        paymentType: {
                            bpjs: entries.filter(function (e) { return e.paymentType === "BPJS"; }).length,
                            umum: entries.filter(function (e) { return e.paymentType === "UMUM"; }).length
                        },
                        dailyStats: {}
                    };
                    // Calculate daily statistics
                    entries.forEach(function (e) {
                        if (e.date) {
                            statistics_1.dailyStats[e.date] = (statistics_1.dailyStats[e.date] || 0) + 1;
                        }
                    });
                    uniqueDays = Object.keys(statistics_1.dailyStats).length;
                    dailyAverage = uniqueDays > 0 ? Math.round(entries.length / uniqueDays) : 0;
                    trafficData = Object.entries(statistics_1.dailyStats)
                        .map(function (_a) {
                        var date = _a[0], count = _a[1];
                        return ({ date: date, count: count });
                    })
                        .sort(function (a, b) { return a.date.localeCompare(b.date); });
                    return [2 /*return*/, res.json({
                            gender: statistics_1.gender,
                            totalPatients: statistics_1.total,
                            paymentTypes: statistics_1.paymentType,
                            dailyAverage: dailyAverage,
                            trafficData: trafficData,
                            metadata: {
                                uniqueDays: uniqueDays,
                                lastUpdated: new Date().toISOString()
                            }
                        })];
                case 2:
                    err_1 = _a.sent();
                    console.error("[statistics] API error:", {
                        message: err_1 === null || err_1 === void 0 ? void 0 : err_1.message,
                        stack: err_1 === null || err_1 === void 0 ? void 0 : err_1.stack,
                        time: new Date().toISOString()
                    });
                    return [2 /*return*/, res.status(500).json({
                            error: 'Internal Server Error',
                            details: (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || String(err_1)
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
