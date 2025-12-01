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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_config_js_1 = require("./env.config.js");
const prismaClient_js_1 = __importDefault(require("../lib/prismaClient.js"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prismaClient_js_1.default.user.findUnique({
            where: { id }
        });
        if (user) {
            const authenticatedUser = {
                userId: user.id,
                email: user.email,
                userName: `${user.firstName} ${user.lastName}`.trim(),
                role: user.role
            };
            done(null, authenticatedUser);
        }
        else {
            done(null, null);
        }
    }
    catch (error) {
        done(error, null);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_config_js_1.GOOGLE_CLIENT_ID,
    clientSecret: env_config_js_1.GOOGLE_CLIENT_SECRET,
    callbackURL: env_config_js_1.GOOGLE_REDIRECT_URI,
    scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Check if user exists
        let user = yield prismaClient_js_1.default.user.findUnique({
            where: { email: profile.emails[0].value }
        });
        if (!user) {
            // Create new user if doesn't exist
            user = yield prismaClient_js_1.default.user.create({
                data: {
                    email: profile.emails[0].value,
                    firstName: ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || '',
                    lastName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName) || '',
                    role: 'JOBSEEKER',
                    googleId: profile.id,
                    isEmailVerified: true
                }
            });
        }
        return done(null, {
            userId: user.id,
            email: user.email,
            userName: `${user.firstName} ${user.lastName}`.trim(),
            role: user.role
        });
    }
    catch (error) {
        return done(error, undefined);
    }
})));
