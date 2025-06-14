import React, { useState, FormEvent } from "react";
import "./MessageInput.scss";
import type { Message } from "../services/api";

interface MessageInputProps {
  onSend: (content: string, parentId?: number) => void;
  parentMessage?: Message | null;
  onCancelReply: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  parentMessage,
  onCancelReply,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    onSend(content, parentMessage?.id);
    setText("");
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      {parentMessage && (
        <div className="reply-banner">
          <span>
            Réponse à <strong>{parentMessage.pseudo}</strong>
          </span>
          <button
            type="button"
            className="btn-cancel-reply"
            onClick={onCancelReply}
          >
            ✕
          </button>
        </div>
      )}
      <input
        type="text"
        className="message-input"
        placeholder={
          parentMessage
            ? `Répondre à ${parentMessage.pseudo}…`
            : "Écrire un message…"
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className="message-send-btn"
        disabled={!text.trim()}
      >
        Envoyer
      </button>
    </form>
  );
};

export default MessageInput;
