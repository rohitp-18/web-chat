import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { io, Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
// import {
//   notificationT,
//   updateChatNotifications,
//   updateInvitations,
//   updateNotificationCount,
// } from "../user/notificationSlice";
// import CustomNotification from "../../components/customNotification";
import { chat, Message } from "../types/chatType";
import { user } from "../types/userType";
import { getAllChats, toggleBlockChat, updateChats } from "../chatSlice";

interface SocketState {
  isConnected: boolean;
  error: string | null;
  socket: Socket | null;
}

interface SocketContextProps extends SocketState {
  connectSocket: (socket: Socket) => void;
  disconnectSocket: () => void;
  setError: (error: string) => void;
  selectedChat: chat | null;
  setSelectedChat: (chat: chat | null) => void;
  selectedUser: user | null;
  setSelectedUser: (user: user | null) => void;
  onlineUser: Set<string>;
}

const initialState: SocketState = {
  isConnected: false,
  error: null,
  socket: null,
};

const SocketContext = createContext<SocketContextProps>({
  ...initialState,
  connectSocket: () => {},
  disconnectSocket: () => {},
  setError: () => {},
  selectedChat: null,
  setSelectedChat: () => {},
  selectedUser: null,
  setSelectedUser: () => {},
  onlineUser: new Set(),
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SocketState>(initialState);
  const [selectedUser, setSelectedUser] = useState<user | null>(null);
  const [selectedChat, setSelectedChat] = useState<chat | null>(null);
  const [onlineUser, setOnlineUsers] = useState<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatCount, setChatCount] = useState(0);
  // const [show, setShow] = useState(false);
  // const [notificationData, setNotificationData] =
  //   useState<notificationT | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { chats, chat } = useSelector((state: RootState) => state.chat);
  // const { totalChats, totalInvitations, totalNotifications } = useSelector(
  //   (state: RootState) => state.notification
  // );

  const connectSocket = (socket: Socket) => {
    setState({ ...state, isConnected: true, socket, error: null });
  };

  const disconnectSocket = () => {
    setState({ ...state, isConnected: false, socket: null, error: null });
  };

  const setError = (error: string) => {
    setState((prevState) => ({ ...prevState, error }));
  };

  async function handleNewMessage(newMessage: Message) {
    if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
      toast.message(newMessage.content, {
        position: "bottom-right",
      });
      dispatch(updateChats({ _id: newMessage.chat._id, message: newMessage }));
    }
  }

  useEffect(() => {
    if (!user) return;
    if (socket) return;
    const newSocket = io("ws://localhost:5000", {
      query: { selectedUser: user._id },
      transports: ["websocket"],
    });

    setSocket(newSocket);
    newSocket.connect();
    newSocket.on("connect", () => {
      newSocket.emit("register_user", user._id);
    });
    connectSocket(newSocket);

    newSocket.on("disconnect", () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, socket]);

  // handle user going offline on window close
  useEffect(() => {
    if (!socket || !user) return;

    const handleBeforeUnload = () => {
      socket.emit("user_going_offline", { userId: user._id, onlineUser });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, user, onlineUser]);

  // handle user going offline on tab switch
  useEffect(() => {
    if (!socket || !user) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        socket.emit("user_going_offline", { userId: user._id, onlineUser });
        setOnlineUsers(new Set());
        socket.disconnect();
        setChatCount(0);
        setState((prev) => ({ ...prev, socket: null, isConnected: false }));
      } else {
        socket.connect();
        dispatch(getAllChats());
        setState((prev) => ({ ...prev, socket, isConnected: true }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, user, onlineUser, dispatch]);

  // handle new messages
  useEffect(() => {
    if (!user || !socket) return;

    socket.on("message received", handleNewMessage);

    return () => {
      socket.off("message received", handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, socket, selectedChat]);

  //check online users whenever chats change
  useEffect(() => {
    if (chats.length > 0 && chats.length !== chatCount && socket && user) {
      setChatCount(chats.length);
      socket.emit("check_online_users", {
        users: [
          ...chats
            .filter((c) => !c.isGroup)
            .map((c) =>
              c.users[0]._id === user._id ? c.users[1]._id : c.users[0]._id
            ),
        ],
        sender: user._id,
      });
    }
  }, [chats, socket, user, chatCount]);

  //initial online users
  useEffect(() => {
    if (socket && user) {
      socket.on("online_users", (data: { onlineUserIds: string[] }) => {
        setOnlineUsers(new Set(data.onlineUserIds));
      });
    }
  }, [socket, state, user, chats, chatCount]);

  //new online user
  useEffect(() => {
    if (socket && user) {
      socket.on("new_online_users", (data: { sender: string }) => {
        setOnlineUsers((prev) => {
          prev.add(data.sender);
          return new Set(prev);
        });
      });
    }
  }, [onlineUser, socket, state, user]);

  //offline users
  useEffect(() => {
    if (socket && user) {
      socket.on("new_offline_users", (data: { sender: string }) => {
        console.log("new_offline users", data.sender);
        setOnlineUsers((prev) => {
          prev.delete(data.sender);
          return new Set(prev);
        });
      });
    }
  }, [onlineUser, socket, state, user]);

  useEffect(() => {
    if (socket && user) {
      socket.on("registered", () => {});
    }
  }, [socket, user, chats]);

  useEffect(() => {
    console.log(onlineUser);
  }, [onlineUser]);

  useEffect(() => {
    if (socket) {
      socket.on("user_blocked", (data) => {
        dispatch(toggleBlockChat(data));
      });
    }
  }, [socket, dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on("user_unblocked", (data) => {
        dispatch(toggleBlockChat(data));
      });
    }
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider
      value={{
        ...state,
        connectSocket,
        disconnectSocket,
        setError,
        selectedChat,
        setSelectedChat,
        selectedUser,
        setSelectedUser,
        onlineUser,
      }}
    >
      {/* {show && notificationData && (
        <CustomNotification
          data={notificationData}
          onClose={() => setShow(false)}
        />
      )} */}
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
