import { Socket } from "socket.io";
import { UnauthorizedError } from "./errorHandler";
import { NextFunction } from "express";

const { io } = require("../config/socket.config.js");
const { verifyToken } = require("../utils/jwt.util.js");

