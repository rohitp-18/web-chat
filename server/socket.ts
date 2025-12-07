import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let onlineUsers: Map<string, string>;
let io: Server;

function setupSocket(server: HttpServer): void {
  onlineUsers = new Map<string, string>();

  // const io = require("socket.io")(server, {
  //   pingTimeout: 60000,
  //   cors: "http://localhost:3000/",
  // });

  // io.on("connection", (socket: any) => {
  //   socket.on("setup", (data: { _id: string }) => {
  //     socket.join(data._id);
  //     socket.emit("connected");
  //   });

  //   socket.on("register_user", (data: string) => {
  //     socket.join(data);
  //   });

  // });

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
      console.log(userId);
      socket.to(userId).emit("registered");
    });

    socket.on("typing", ({ chat, user }: { chat: string; user: string }) => {
      socket.in(chat).emit("typing", user);
    });

    socket.on("stop typing", ({ chat, user }: { chat: string; user: string }) =>
      socket.in(chat).emit("stop typing", user)
    );

    socket.on("new message", (data: any) => {
      data.chat.users.forEach((user: { _id: string }) => {
        if (data.sender._id === user._id) return;
        socket.in(user._id).emit("message received", data);
      });
    });

    socket.on("check_online_users", ({ users }: { users: string[] }) => {
      const onlineUserIds = users.filter((user: string) =>
        onlineUsers.has(user)
      );
      console.log(users, onlineUserIds, onlineUsers);

      onlineUserIds.map((u: string) =>
        socket.to(u).emit("online_users", {
          onlineUserIds,
          sender: users[users.length - 1],
        })
      );
      socket
        .to(users[users.length - 1])
        .emit("online_users", { onlineUserIds });
    });

    socket.on("read_message", (data: any) => {
      socket.to(data.userId).emit("message_read", data);
    });

    socket.on("all_read_messages", (data: any) => {
      socket.to(data.userId).emit("all_messages_read", data);
    });

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
  });
}

export { io, onlineUsers };

export default setupSocket;
