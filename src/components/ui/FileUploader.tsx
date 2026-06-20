import { useState, useCallback, useRef } from "react";
import { Iconify } from "../iconify/iconify";

interface FileUploaderProps {
  files?: string[];
  onDrop?: (files: File[]) => void;
  onRemove?: (file: string) => void;
  thumbnail?: boolean;
}

export function FileUploader({
  files: initialFiles = [],
  onDrop,
  onRemove,
  thumbnail = true,
}: FileUploaderProps) {
  const [files, setFiles] = useState(initialFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      const newFiles = dropped.map((f) => f.name);
      setFiles((prev) => [...prev, ...newFiles]);
      onDrop?.(dropped);
    },
    [onDrop]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      const newFiles = selected.map((f) => f.name);
      setFiles((prev) => [...prev, ...newFiles]);
      onDrop?.(selected);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onDrop]
  );

  const handleRemove = useCallback(
    (file: string) => {
      setFiles((prev) => prev.filter((f) => f !== file));
      onRemove?.(file);
    },
    [onRemove]
  );

  return (
    <div className="flex flex-wrap gap-1">
      {files.map((file) => (
        <div
          key={file}
          className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
          onClick={() => handleRemove(file)}
        >
          {thumbnail ? (
            <img src={file} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="block p-1 text-xs text-text">{file}</span>
          )}
        </div>
      ))}

      <div
        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted/40 text-muted transition-colors hover:border-primary hover:text-primary"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Iconify icon="mingcute:add-line" width={20} />
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
