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
import { createServer } from "http";
import { storage } from "./storage";
import { insertDataEntrySchema } from "@shared/schema";
import { z } from "zod";
export function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            // Data Entries Routes
            app.post("/api/data-entries", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var validatedData, entry, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            validatedData = insertDataEntrySchema.parse(req.body);
                            return [4 /*yield*/, storage.createDataEntry(validatedData)];
                        case 1:
                            entry = _a.sent();
                            res.json(entry);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            if (error_1 instanceof z.ZodError) {
                                res.status(400).json({ message: "Invalid data", errors: error_1.errors });
                            }
                            else {
                                res.status(500).json({ message: "Internal server error" });
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/data-entries", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, startDate, endDate, name_1, medicalRecord, action, entries, filteredEntries, searchTerm_1, searchTerm_2, searchTerm_3, entries, entries, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            _a = req.query, startDate = _a.startDate, endDate = _a.endDate, name_1 = _a.name, medicalRecord = _a.medicalRecord, action = _a.action;
                            if (!(name_1 || medicalRecord || action)) return [3 /*break*/, 2];
                            return [4 /*yield*/, storage.getDataEntries()];
                        case 1:
                            entries = _b.sent();
                            filteredEntries = entries;
                            // Filter berdasarkan nama
                            if (name_1) {
                                searchTerm_1 = name_1.toLowerCase();
                                filteredEntries = filteredEntries.filter(function (entry) {
                                    return entry.patientName.toLowerCase().includes(searchTerm_1);
                                });
                            }
                            // Filter berdasarkan nomor rekam medis
                            if (medicalRecord) {
                                searchTerm_2 = medicalRecord.toLowerCase();
                                filteredEntries = filteredEntries.filter(function (entry) {
                                    return entry.medicalRecordNumber.toLowerCase().includes(searchTerm_2);
                                });
                            }
                            // Filter berdasarkan tindakan
                            if (action) {
                                searchTerm_3 = action.toLowerCase();
                                filteredEntries = filteredEntries.filter(function (entry) {
                                    // Cek di array actions
                                    var actionsMatch = entry.actions.some(function (act) {
                                        return act.toLowerCase().includes(searchTerm_3);
                                    });
                                    // Cek di otherActions
                                    var otherActionsMatch = entry.otherActions ?
                                        entry.otherActions.toLowerCase().includes(searchTerm_3) : false;
                                    return actionsMatch || otherActionsMatch;
                                });
                            }
                            return [2 /*return*/, res.json(filteredEntries)];
                        case 2:
                            if (!(startDate && endDate)) return [3 /*break*/, 4];
                            return [4 /*yield*/, storage.getDataEntriesByDateRange(startDate, endDate)];
                        case 3:
                            entries = _b.sent();
                            res.json(entries);
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, storage.getDataEntries()];
                        case 5:
                            entries = _b.sent();
                            res.json(entries);
                            _b.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_2 = _b.sent();
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/data-entries/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, entry, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = parseInt(req.params.id);
                            return [4 /*yield*/, storage.getDataEntryById(id)];
                        case 1:
                            entry = _a.sent();
                            if (!entry) {
                                res.status(404).json({ message: "Data entry not found" });
                                return [2 /*return*/];
                            }
                            res.json(entry);
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/data-entries/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, validatedData, updatedEntry, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = parseInt(req.params.id);
                            validatedData = insertDataEntrySchema.partial().parse(req.body);
                            return [4 /*yield*/, storage.updateDataEntry(id, validatedData)];
                        case 1:
                            updatedEntry = _a.sent();
                            if (!updatedEntry) {
                                res.status(404).json({ message: "Data entry not found" });
                                return [2 /*return*/];
                            }
                            res.json(updatedEntry);
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            if (error_4 instanceof z.ZodError) {
                                res.status(400).json({ message: "Invalid data", errors: error_4.errors });
                            }
                            else {
                                res.status(500).json({ message: "Internal server error" });
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/data-entries/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, deleted, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = parseInt(req.params.id);
                            return [4 /*yield*/, storage.deleteDataEntry(id)];
                        case 1:
                            deleted = _a.sent();
                            if (!deleted) {
                                res.status(404).json({ message: "Data entry not found" });
                                return [2 /*return*/];
                            }
                            res.json({ message: "Data entry deleted successfully" });
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Daily visits endpoint
            app.get("/api/daily-visits", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var date, targetDate, dailyEntries, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            date = req.query.date;
                            targetDate = date || new Date().toISOString().split('T')[0];
                            return [4 /*yield*/, storage.getDataEntriesByDateRange(targetDate, targetDate)];
                        case 1:
                            dailyEntries = _a.sent();
                            res.json(dailyEntries);
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Statistics endpoint
            app.get("/api/statistics", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var entries, today, thisMonth_1, monthEntries, maleCount, femaleCount, uniqueDates, dailyAverage, bpjsCount, umumCount, totalPatients, trafficData_1, dateGroups, actionCounts, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage.getDataEntries()];
                        case 1:
                            entries = _a.sent();
                            today = new Date().toISOString().split('T')[0];
                            thisMonth_1 = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                            monthEntries = entries.filter(function (entry) { return entry.date >= thisMonth_1; });
                            maleCount = monthEntries.filter(function (entry) { return entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki'; }).length;
                            femaleCount = monthEntries.filter(function (entry) { return entry.gender && entry.gender.trim().toLowerCase() === 'perempuan'; }).length;
                            uniqueDates = Array.from(new Set(entries.map(function (entry) { return entry.date; })));
                            dailyAverage = uniqueDates.length > 0 ? Math.round(entries.length / uniqueDates.length) : 0;
                            bpjsCount = entries.filter(function (entry) { return entry.paymentType === 'BPJS'; }).length;
                            umumCount = entries.filter(function (entry) { return entry.paymentType === 'UMUM'; }).length;
                            totalPatients = entries.length;
                            trafficData_1 = [];
                            dateGroups = entries.reduce(function (acc, entry) {
                                var date = entry.date;
                                if (!acc[date]) {
                                    acc[date] = { date: date, male: 0, female: 0 };
                                }
                                // Perbaikan: Pastikan pengecekan gender yang tepat untuk semua format
                                if (entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki') {
                                    acc[date].male += 1;
                                }
                                else if (entry.gender && entry.gender.trim().toLowerCase() === 'perempuan') {
                                    acc[date].female += 1;
                                }
                                return acc;
                            }, {});
                            Object.values(dateGroups)
                                .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); })
                                .forEach(function (data) { return trafficData_1.push(data); });
                            actionCounts = entries.reduce(function (acc, entry) {
                                entry.actions.forEach(function (action) {
                                    acc[action] = (acc[action] || 0) + 1;
                                });
                                return acc;
                            }, {});
                            res.json({
                                maleMonthly: maleCount,
                                femaleMonthly: femaleCount,
                                dailyAverage: dailyAverage,
                                bpjsCount: bpjsCount,
                                umumCount: umumCount,
                                totalPatients: totalPatients,
                                trafficData: trafficData_1,
                                actionDistribution: actionCounts
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            httpServer = createServer(app);
            return [2 /*return*/, httpServer];
        });
    });
}
