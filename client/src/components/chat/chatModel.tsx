import { Avatar } from "@mui/material";
import {
  isSameSender,
  isSameUser,
  isLastMessage,
  isSameSenderMargin,
} from "@/utils/logic";
// import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Message } from "@/store/types/chatType";

const ChatModel = ({ message }: { message: Message[] }) => {
  // const [scroll, setScroll] = useState(false);
  // const span = useRef<HTMLSpanElement>(null);
  // const div = useRef<HTMLDivElement>(null);
  // const spans = useRef(null);

  const { user } = useSelector((state: RootState) => state.user);

  if (!user) return null;

  return (
    <div
      className="px-2 h-[calc(100vh-138px)] overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        overflowY: "auto",
      }}
      ref={(el) => {
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }}
    >
      {message &&
        message.map((m, i) => (
          <div
            id={`m-${m._id}`}
            style={{ display: "flex", alignItems: "flex-end" }}
            key={m._id}
          >
            {(isSameSender(message, m, i, user._id) ||
              isLastMessage(message, i, user._id)) && (
              <Avatar
                className="z-0"
                sx={{
                  width: 32,
                  height: 32,
                  marginRight: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  background:
                    "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
                }}
              />
            )}
            <span
              style={{
                background: `${
                  m.sender._id === user._id
                    ? "linear-gradient(135deg, #e3f0fc 0%, #f9fafb 100%)"
                    : "linear-gradient(135deg, #e0f7ef 0%, #f9fafb 100%)"
                }`,
                color: "#222",
                marginLeft: isSameSenderMargin(message, m, i, user._id),
                marginTop: isSameUser(message, m, i) ? 3 : 10,
                borderRadius:
                  m.sender._id === user._id
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                padding: "10px 18px",
                maxWidth: "70%",
                marginBottom: "2px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                fontSize: "1rem",
                fontFamily: "Segoe UI, sans-serif",
                transition: "background 0.3s",
              }}
              // ref={i === message.length - 1 ? span : spans}
            >
              {m.content}
            </span>
          </div>
        ))}
    </div>
  );
};

export default ChatModel;
