import React, { useState, FormEvent } from "react";

interface MessageInputProps {
  onSend: (content: string, parentId?: number) => void;
  parentId?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, parentId }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    onSend(content, parentId);
    setText("");
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        placeholder="Écrire un message…"
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
