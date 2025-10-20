import { io } from "../config/socket.config.js";
import { verifyToken } from "./auth.middleware.js";
import { UnauthorizedError } from "./errorHandler.js";

io.use(async (socket, next) => {
  try {
    const token: string = socket.handshake.auth.token.split(' ')[1];
    const user = await verifyToken(token);

    if (!user) {
      return new UnauthorizedError();
    }

    socket.data.user = user;
    next();
  } catch (error) {
    return new UnauthorizedError();
  }
})