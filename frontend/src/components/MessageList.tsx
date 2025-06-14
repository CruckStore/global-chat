import React from "react";
import type { Message, User } from "../services/api";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onReply: (content: string, parentId?: number) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="message-list">
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          m={m}
          currentUser={currentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default MessageList;
