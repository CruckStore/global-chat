import React, { useState } from "react";
import "./MessageItem.scss";
import type { Message, User } from "../services/api";

interface MessageItemProps {
  m: Message;
  parentMessage?: Message;
  currentUser: User;
  onReplyInitiate: (message: Message) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  m,
  parentMessage,
  currentUser,
  onReplyInitiate,
  onEdit,
  onDelete,
}) => {
  const own = m.user_id === currentUser.userId;
  const canEdit =
    own && (currentUser.role === "premium" || currentUser.role === "admin");
  const canDelete = currentUser.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(m.content);

  const saveEdit = () => {
    const txt = draft.trim();
    if (txt && txt !== m.content) onEdit(m.id, txt);
    setIsEditing(false);
  };
  const cancelEdit = () => {
    setDraft(m.content);
    setIsEditing(false);
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
            <button className="btn-save" onClick={saveEdit}>
              Sauvegarder
            </button>
            <button className="btn-cancel" onClick={cancelEdit}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="message-content">{m.content}</div>
      )}

      {!isEditing && (
        <div className="message-actions">
          <button className="btn-reply" onClick={() => onReplyInitiate(m)}>
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
