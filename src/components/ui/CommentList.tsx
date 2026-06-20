import { useState, useCallback } from "react";
import { Iconify } from "../iconify/iconify";

interface Comment {
  id: string;
  name: string;
  message: string;
  messageType?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function CommentList({ comments }: CommentListProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const slides = comments
    .filter((c) => c.messageType === "image")
    .map((c) => ({ src: c.message }));

  const handleOpen = useCallback((src: string) => setLightboxSrc(src), []);
  const handleClose = useCallback(() => setLightboxSrc(null), []);

  const currentIndex = lightboxSrc
    ? slides.findIndex((s) => s.src === lightboxSrc)
    : -1;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-strong">
              {comment.avatarUrl ? (
                <img
                  src={comment.avatarUrl}
                  alt={comment.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text">{comment.name}</span>
                <span className="text-xs text-muted">{timeAgo(comment.createdAt)}</span>
              </div>

              {comment.messageType === "image" ? (
                <img
                  alt={comment.message}
                  src={comment.message}
                  onClick={() => handleOpen(comment.message)}
                  className="mt-1 cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-80"
                  style={{ maxWidth: 240, maxHeight: 180 }}
                />
              ) : (
                <p className="mt-0.5 text-sm leading-relaxed text-text">{comment.message}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {lightboxSrc && currentIndex >= 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={handleClose}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
            onClick={handleClose}
          >
            <Iconify icon="eva:close-fill" width={24} />
          </button>

          {currentIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxSrc(slides[currentIndex - 1].src);
              }}
            >
              <Iconify icon="eva:arrow-ios-back-fill" width={24} />
            </button>
          )}

          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {currentIndex < slides.length - 1 && (
            <button
              type="button"
              className="absolute right-16 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxSrc(slides[currentIndex + 1].src);
              }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" width={24} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
