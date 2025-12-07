import { Message } from "@/store/types/chatType";

const isSameSenderMargin = (
  messages: Message[],
  m: Message,
  i: number,
  userId: string
) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 40;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

const isSameSender = (
  messages: Message[],
  m: Message,
  i: number,
  userId: string
) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

const isLastMessage = (messages: Message[], i: number, userId: string) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

const isSameUser = (messages: Message[], m: Message, i: number) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export { isSameSender, isSameUser, isLastMessage, isSameSenderMargin };
