import React from "react";
import "./MessageItem.css";
import type { Message, User } from "../services/api";

interface MessageItemProps {
  m: Message;
  currentUser: User;
  onReply: (content: string, parentId?: number) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  m,
  currentUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  const own = m.user_id === currentUser.userId;
  const canEdit =
    own && (currentUser.role === "premium" || currentUser.role === "admin");
  const canDelete = currentUser.role === "admin";

  const handleReply = () => {
    const reply = prompt("Votre réponse :");
    if (reply) onReply(reply, m.id);
  };

  const handleEdit = () => {
    const edited = prompt("Modifier votre message :", m.content);
    if (edited) onEdit(m.id, edited);
  };

  return (
    <div className="message-item">
      <div className="message-header">
        <span className="message-pseudo">{m.pseudo}</span>
        <span className="message-time">
          {new Date(m.timestamp).toLocaleTimeString()}
        </span>
        {m.edited && <span className="message-edited">(modifié)</span>}
      </div>
      <div className="message-content">{m.content}</div>
      <div className="message-actions">
        <button className="btn-reply" onClick={handleReply}>
          Répondre
        </button>
        {canEdit && (
          <button className="btn-edit" onClick={handleEdit}>
            Modifier
          </button>
        )}
        {own && !canEdit && (
          <span className="no-permission">– pas autorisé à modifier</span>
        )}
        {canDelete && (
          <button className="btn-delete" onClick={() => onDelete(m.id)}>
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
