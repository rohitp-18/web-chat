import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let onlineUsers: Map<string, string>;
let io: Server;

function setupSocket(server: HttpServer): void {
  onlineUsers = new Map<string, string>();

  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: [
        "http://localhost:3000/",
        "http://localhost/",
        "https://relievingly-noncongratulatory-micheline.ngrok-free.dev/",
      ],
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  io.on("connection", (socket: Socket) => {
    // Store the user ID with the socket ID
    socket.on("register_user", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      socket.emit("registered", { success: true, userId });
    });

    socket.on(
      "typing",
      ({ receiver, user }: { receiver: string; user: string }) => {
        socket.to(receiver).emit("typing", user);
      }
    );

    socket.on(
      "stop typing",
      ({ receiver, user }: { receiver: string; user: string }) =>
        socket.to(receiver).emit("stop typing", user)
    );

    socket.on("new message", (data: any) => {
      data.chat.users.forEach((user: { _id: string }) => {
        if (data.sender._id === user._id) return;
        socket.in(user._id).emit("message received", data);
      });
    });

    socket.on(
      "check_online_users",
      ({ users, sender }: { users: string[]; sender: string }) => {
        const onlineUserIds = users.filter((user: string) =>
          onlineUsers.has(user)
        );

        if (sender) {
          onlineUserIds.map((u: string) =>
            socket.to(u).emit("new_online_users", {
              sender,
            })
          );
        }
        socket.emit("online_users", { onlineUserIds });
      }
    );

    socket.on("read_message", (data: any) => {
      socket.to(data.userId).emit("message_read", data);
    });

    socket.on("all_read_messages", (data: any) => {
      socket.to(data.userId).emit("all_messages_read", data);
    });

    socket.on(
      "user_going_offline",
      (data: { userId: string; onlineUser: Set<string> }) => {
        console.log(data, "user going offline");
        const { userId, onlineUser } = data;
        const socketIds = [...onlineUsers.values()];
        for (const uid of socketIds) {
          socket.to(uid).emit("new_offline_users", {
            sender: userId,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      });
    });

    // notification
    socket.on("send_notification", (data: any) => {
      const { userId, notification } = data;
      if (onlineUsers.has(userId)) {
        io.to(userId).emit("receive_notification", notification);
      }
    });

    // block chat
    socket.on("block user", (data: any) => {
      const { userId, blockedBy, chatId } = data;
      if (onlineUsers.has(userId)) {
        io.to(userId).emit("user_blocked", { blockedBy, chatId });
      }
    });

    // unblock chat
    socket.on("unblock user", (data: any) => {
      const { userId } = data;
      if (onlineUsers.has(userId)) {
        io.to(userId).emit("user_unblocked", data);
      }
    });
  });
}

export { io, onlineUsers };

export default setupSocket;
