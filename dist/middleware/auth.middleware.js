"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_js_1 = require("@/middleware/errorHandler.js");
const env_config_js_1 = require("@/config/env.config.js");
const client_js_1 = __importDefault(require("@/lib/client.js"));
const verifyToken = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (typeof decoded === 'object' && decoded !== null) {
        if (!decoded || (decoded.exp && decoded.exp < Date.now().valueOf() / 1000)) {
            throw new errorHandler_js_1.UnauthorizedError("Token has expired");
        }
    }
    // Verify token with the secret
    const secret = env_config_js_1.JWT_SECRET;
    const user = jsonwebtoken_1.default.verify(token, secret);
    return Promise.resolve(user);
};
exports.verifyToken = verifyToken;
const authorize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new errorHandler_js_1.BadRequestError("Authentication token is required");
        }
        // Check if token is in blacklist
        const isBlacklistedToken = yield client_js_1.default.blacklistedToken.findFirst({
            where: { token }
        });
        if (isBlacklistedToken) {
            throw new errorHandler_js_1.UnauthorizedError("Token has been revoked");
        }
        try {
            const user = yield (0, exports.verifyToken)(token);
            req.user = user;
            next();
        }
        catch (jwtError) {
            throw new errorHandler_js_1.UnauthorizedError("Invalid authentication token");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = authorize;
