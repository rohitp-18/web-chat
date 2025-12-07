import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
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
import { updateChats } from "../chatSlice";

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
  onlineUser: string[];
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
  onlineUser: [],
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SocketState>(initialState);
  const [selectedUser, setSelectedUser] = useState<user | null>(null);
  const [selectedChat, setSelectedChat] = useState<chat | null>(null);
  const [onlineUser, setOnlineUsers] = useState<string[]>([]);
  const [getOnlineUser, setGetOnlineUsers] = useState(false);
  // const [show, setShow] = useState(false);
  // const [notificationData, setNotificationData] =
  //   useState<notificationT | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { chats } = useSelector((state: RootState) => state.chat);
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

  const checkOnlineUser = useCallback(() => {
    console.log("online users");
    if (state.socket && user) {
      state.socket.emit("check_online_users", {
        users: [
          ...chats
            .filter((c) => !c.isGroup)
            .map((c) =>
              c.users[0]._id === user._id ? c.users[1]._id : c.users[0]._id
            ),
          user._id,
        ],
      });
    }
  }, [state, user, chats]);

  useEffect(() => {
    if (!user) return;
    if (state.socket) return;
    const newSocket = io("ws://localhost:5000", {
      query: { selectedUser: user._id },
      transports: ["websocket"],
    });
    newSocket.connect();
    newSocket.on("connect", () => {
      newSocket.emit("register_user", user._id);
    });
    connectSocket(newSocket);

    newSocket.on("disconnect", () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, state.socket]);

  // handle new messages
  useEffect(() => {
    if (!user || !state.socket) return;
    const { socket } = state;

    socket.on("message received", handleNewMessage);

    return () => {
      socket.off("message received", handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, state.socket, selectedChat]);

  useEffect(() => {
    const { socket } = state;
    console.log(chats.length, socket);
    if (chats.length > 0 && !getOnlineUser && socket && user) {
      checkOnlineUser();
    }
  }, [getOnlineUser, chats, checkOnlineUser, state, state.socket, user]);

  useEffect(() => {
    console.log("line 47");
    const { socket } = state;
    if (socket && user) {
      socket.on("online_users", (data: { onlineUserIds: string[] }) => {
        setOnlineUsers(data.onlineUserIds);
        setGetOnlineUsers(true);
        console.log(data);
        socket.emit("check_online_users", {
          users: [data.onlineUserIds[data.onlineUserIds.length - 1]],
        });
      });
    }
  }, [state.socket, state, user]);

  useEffect(() => {
    if (state.socket) state.socket.on("registered", () => checkOnlineUser());
  }, [state.socket, checkOnlineUser]);

  useEffect(() => {
    console.log(onlineUser);
  }, [onlineUser]);

  // useEffect(() => {
  //   if (show && notificationData) {
  //     const timer = setTimeout(() => {
  //       setShow(false);
  //       setNotificationData(null);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [show, notificationData]);

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
