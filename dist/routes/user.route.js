"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_js_1 = require("@/controllers/user.controller.js");
const express_1 = require("express");
const auth_middleware_js_1 = __importDefault(require("@/middleware/auth.middleware.js"));
const user_controller_js_2 = require("@/controllers/user.controller.js");
const userRouter = (0, express_1.Router)();
userRouter.get('/me', auth_middleware_js_1.default, user_controller_js_2.getCurrentUser);
userRouter.get('/', user_controller_js_1.getAllUsers);
userRouter.get('/:id', auth_middleware_js_1.default, user_controller_js_1.getUserById);
exports.default = userRouter;
