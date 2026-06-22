import { useState, useCallback } from "react";
import { Iconify } from "../iconify/iconify";
import { Scrollbar } from "../scrollbar/scrollbar";

interface Contact {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface ContactPickerProps {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
  assignedIds?: string[];
  onAssign?: (contact: Contact) => void;
  onUnassign?: (contact: Contact) => void;
}

const ITEM_HEIGHT = 64;

export function ContactPicker({
  open,
  onClose,
  contacts,
  assignedIds = [],
  onAssign,
  onUnassign,
}: ContactPickerProps) {
  const [search, setSearch] = useState("");

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const filtered = search
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const notFound = !filtered.length && !!search;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col rounded-2xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-1">
          <h2 className="text-lg font-bold text-text">
            Contacts <span className="text-muted">({contacts.length})</span>
          </h2>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
            <Iconify icon="eva:search-fill" width={16} className="text-muted" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search..."
              className="flex-1 border-0 bg-transparent text-sm text-text outline-none placeholder:text-muted/50"
            />
          </div>
        </div>

        <div className="px-0 pb-4">
          {notFound ? (
            <div className="py-10 text-center">
              <p className="font-bold text-text">Not found</p>
              <p className="text-sm text-muted">
                No results found for <strong>{search}</strong>
              </p>
            </div>
          ) : (
            <Scrollbar sx={{ height: ITEM_HEIGHT * 6, paddingLeft: 10, paddingRight: 10 } as React.CSSProperties}>
              <ul>
                {filtered.map((contact) => {
                  const isAssigned = assignedIds.includes(contact.id);
                  return (
                    <li
                      key={contact.id}
                      className="flex items-center gap-3 px-2"
                      style={{ height: ITEM_HEIGHT }}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-strong">
                        {contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-text">{contact.name}</p>
                        <p className="truncate text-xs text-muted">{contact.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isAssigned
                            ? onUnassign?.(contact)
                            : onAssign?.(contact)
                        }
                        className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                          isAssigned
                            ? "bg-primary-soft text-primary-dark"
                            : "bg-surface-strong text-muted hover:text-text"
                        }`}
                      >
                        <Iconify
                          width={14}
                          icon={isAssigned ? "eva:checkmark-fill" : "mingcute:add-line"}
                        />
                        {isAssigned ? "Assigned" : "Assign"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Scrollbar>
          )}
        </div>
      </div>
    </div>
  );
}
