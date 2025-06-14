import React, { useState } from "react";
import "./MessageItem.scss";
import type { Message, User } from "../services/api";

interface MessageItemProps {
  m: Message;
  parentMessage?: Message;
  currentUser: User;
  onReply: (content: string, parentId?: number) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  m,
  parentMessage,
  currentUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  const own = m.user_id === currentUser.userId;
  const canEdit =
    own && (currentUser.role === "premium" || currentUser.role === "admin");
  const canDelete = currentUser.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(m.content);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== m.content) {
      onEdit(m.id, trimmed);
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setDraft(m.content);
    setIsEditing(false);
  };

  const handleReply = () => {
    const reply = window.prompt("Votre réponse :");
    if (reply) onReply(reply, m.id);
  };

  return (
    <div
      className={`message-item
        ${own ? "self" : "other"}
        ${m.parent_id ? "reply" : ""}
      `}
    >
      <div className="message-header">
        <span className="message-pseudo">{m.pseudo}</span>
        <span className="message-time">
          {new Date(m.timestamp).toLocaleTimeString()}
        </span>
        {m.edited && <span className="message-edited">(modifié)</span>}
      </div>

      {parentMessage && (
        <div className="message-reply-to">
          Réponse à <strong>{parentMessage.pseudo}</strong> :
          <em>
            {" "}
            {parentMessage.content.slice(0, 50)}
            {parentMessage.content.length > 50 ? "…" : ""}
          </em>
        </div>
      )}

      {isEditing ? (
        <div className="inline-editor">
          <textarea
            className="inline-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="inline-actions">
            <button className="btn-save" onClick={handleSave}>
              Sauvegarder
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="message-content">{m.content}</div>
      )}

      {!isEditing && (
        <div className="message-actions">
          <button className="btn-reply" onClick={handleReply}>
            Répondre
          </button>
          {canEdit && (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
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
      )}
    </div>
  );
};

export default MessageItem;
