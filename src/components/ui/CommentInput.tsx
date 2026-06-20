import { useState, useCallback } from "react";
import { Iconify } from "../iconify/iconify";

interface CommentInputProps {
  onSubmit?: (text: string) => void;
  avatarUrl?: string;
  avatarAlt?: string;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  avatarUrl,
  avatarAlt,
  placeholder = "Type a message",
}: CommentInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit?.(text);
      setText("");
    }
  }, [text, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex gap-2 px-4 py-3">
      {avatarUrl !== undefined && (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-strong">
          {avatarUrl ? (
            <img src={avatarUrl} alt={avatarAlt || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">
              {avatarAlt?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col rounded-xl border border-border bg-transparent p-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none border-0 bg-transparent px-2 text-sm text-text outline-none placeholder:text-muted/50"
        />

        <div className="flex items-center">
          <div className="flex flex-1 gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-text"
            >
              <Iconify icon="solar:gallery-add-bold" width={18} />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-strong hover:text-text"
            >
              <Iconify icon="eva:attach-2-fill" width={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-dark disabled:opacity-40"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}
