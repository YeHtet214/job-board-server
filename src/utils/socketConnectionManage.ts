import { SocketDataType, SocketUser } from "@/config/socket.config";
import { Server, Socket } from "socket.io";

export const handleOnConnection = (socket: Socket, io: Server, user: SocketUser, userSockets: SocketDataType) => {
    const userSocketSet = userSockets.get(user.userId) || new Set<string>();
    userSocketSet.add(socket.id); // Add new socket ID to the set [unique IDs]
    userSockets.set(user.userId, userSocketSet);

    io.emit("presence:update", { userId: user.userId, status: "online" });
    socket.join(user.userId); // Join room for userId for notifications
}

export const handleOnDisconnect = (socket: Socket, io: Server, userSockets: SocketDataType, socketToUser: Map<string, string>) => {
    const userId = socketToUser.get(socket.id);

    if (userId) {
        const set = userSockets.get(userId);
        if (set) {
            set.delete(socket.id);
            if (set.size === 0) {
                userSockets.delete(userId);
                // user fully offline
                io.emit("presence:update", { userId: userId, status: "offline" });
            } else {
                userSockets.set(userId, set);
            }
        }
    }

    socketToUser.delete(socket.id);
}

