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
import { Pool } from "pg";
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
});
pool.on('error', function (err) {
    console.error('[Database] Unexpected error on idle client', {
        message: err.message,
        stack: err.stack,
        time: new Date().toISOString()
    });
});
pool.on('connect', function () {
    console.log('[Database] New client connected', {
        time: new Date().toISOString(),
        poolSize: pool.totalCount,
        waiting: pool.waitingCount
    });
});
// Add connection testing function
function testConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var client, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    console.log('Database connection successful');
                    client.release();
                    return [2 /*return*/, true];
                case 2:
                    err_1 = _a.sent();
                    console.error('Database connection error:', err_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Test connection on startup
testConnection();
var PostgresStorage = /** @class */ (function () {
    function PostgresStorage() {
    }
    PostgresStorage.prototype.withConnection = function (operation) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, operation(client)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_1 = _a.sent();
                        console.error('[Database] Operation failed', {
                            error: error_1.message,
                            stack: error_1.stack,
                            time: new Date().toISOString()
                        });
                        throw error_1;
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query('SELECT * FROM users WHERE id = $1', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error in getUser:", error_2);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query('SELECT * FROM users WHERE username = $1', [username])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error in getUserByUsername:", error_3);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [insertUser.username, insertUser.password])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0]];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error in createUser:", error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createDataEntry = function (insertEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query("INSERT INTO data_entries (\n          date, patient_name, medical_record_number, gender, payment_type, actions, other_actions, description\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [
                                insertEntry.date,
                                insertEntry.patientName,
                                insertEntry.medicalRecordNumber,
                                insertEntry.gender,
                                insertEntry.paymentType,
                                JSON.stringify(insertEntry.actions || []),
                                insertEntry.otherActions || null,
                                insertEntry.description || null
                            ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.mapDataEntryFromDb(result.rows[0])];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error in createDataEntry:", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getDataEntries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.withConnection(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.query('SELECT * FROM data_entries ORDER BY date DESC')];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, result.rows];
                            }
                        });
                    }); })];
            });
        });
    };
    PostgresStorage.prototype.getDataEntryById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query('SELECT * FROM data_entries WHERE id = $1', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.length ? this.mapDataEntryFromDb(result.rows[0]) : undefined];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error in getDataEntryById:", error_6);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getDataEntriesByDateRange = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.withConnection(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.query('SELECT * FROM data_entries WHERE date >= $1 AND date <= $2 ORDER BY date DESC', [startDate, endDate])];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, result.rows];
                            }
                        });
                    }); })];
            });
        });
    };
    PostgresStorage.prototype.updateDataEntry = function (id, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, values, paramIndex, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        updates = [];
                        values = [];
                        paramIndex = 1;
                        if (updateData.date !== undefined) {
                            updates.push("date = $".concat(paramIndex));
                            values.push(updateData.date);
                            paramIndex++;
                        }
                        if (updateData.patientName !== undefined) {
                            updates.push("patient_name = $".concat(paramIndex));
                            values.push(updateData.patientName);
                            paramIndex++;
                        }
                        if (updateData.medicalRecordNumber !== undefined) {
                            updates.push("medical_record_number = $".concat(paramIndex));
                            values.push(updateData.medicalRecordNumber);
                            paramIndex++;
                        }
                        if (updateData.gender !== undefined) {
                            updates.push("gender = $".concat(paramIndex));
                            values.push(updateData.gender);
                            paramIndex++;
                        }
                        if (updateData.paymentType !== undefined) {
                            updates.push("payment_type = $".concat(paramIndex));
                            values.push(updateData.paymentType);
                            paramIndex++;
                        }
                        if (updateData.actions !== undefined) {
                            updates.push("actions = $".concat(paramIndex));
                            values.push(JSON.stringify(updateData.actions));
                            paramIndex++;
                        }
                        if (updateData.otherActions !== undefined) {
                            updates.push("other_actions = $".concat(paramIndex));
                            values.push(updateData.otherActions);
                            paramIndex++;
                        }
                        if (updateData.description !== undefined) {
                            updates.push("description = $".concat(paramIndex));
                            values.push(updateData.description);
                            paramIndex++;
                        }
                        if (!(updates.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getDataEntryById(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        values.push(id);
                        return [4 /*yield*/, pool.query("UPDATE data_entries SET ".concat(updates.join(', '), " WHERE id = $").concat(paramIndex, " RETURNING *"), values)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.length ? this.mapDataEntryFromDb(result.rows[0]) : undefined];
                    case 4:
                        error_7 = _a.sent();
                        console.error("Error in updateDataEntry:", error_7);
                        return [2 /*return*/, undefined];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.deleteDataEntry = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pool.query('DELETE FROM data_entries WHERE id = $1 RETURNING id', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.length > 0];
                    case 2:
                        error_8 = _a.sent();
                        console.error("Error in deleteDataEntry:", error_8);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.mapDataEntryFromDb = function (row) {
        return {
            id: row.id,
            date: row.date,
            patientName: row.patient_name,
            medicalRecordNumber: row.medical_record_number,
            gender: row.gender,
            paymentType: row.payment_type,
            actions: Array.isArray(row.actions) ? row.actions : JSON.parse(row.actions || '[]'),
            otherActions: row.other_actions,
            description: row.description,
            createdAt: row.created_at
        };
    };
    return PostgresStorage;
}());
export var storage = new PostgresStorage();
