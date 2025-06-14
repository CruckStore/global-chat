import React, { useMemo } from "react";
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
  const messageMap = useMemo(
    () => new Map<number, Message>(messages.map((msg) => [msg.id, msg])),
    [messages]
  );

  return (
    <div className="message-list">
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          m={m}
          parentMessage={m.parent_id ? messageMap.get(m.parent_id!) : undefined}
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
