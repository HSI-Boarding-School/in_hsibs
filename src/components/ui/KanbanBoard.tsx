import { useState, useCallback, type ReactNode } from "react";
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Iconify } from "../iconify/iconify";

export interface KanbanColumnDef {
  id: string;
  label: string;
}

interface KanbanBoardProps {
  columns: KanbanColumnDef[];
  columnItems: Record<string, string[]>;
  renderCard: (itemId: string) => ReactNode;
  onDragEnd: (activeId: string, overId: string | null, activeCol: string, overCol: string, newIndex: number) => void;
  getColumnId: (itemId: string) => string;
  onAddColumn?: (id: string, label: string) => void;
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column" } });

  return (
    <div
      ref={setNodeRef}
      className={`flex shrink-0 flex-col rounded-2xl border p-4 transition-shadow ${
        isOver
          ? "border-primary/40 bg-primary-soft/20 shadow-[0_0_0_2px_rgba(37,99,235,0.15)]"
          : "border-border/60 bg-surface/60"
      }`}
      style={{ width: "var(--kanban-col-width, 320px)" }}
    >
      {children}
    </div>
  );
}

export function KanbanBoard({
  columns,
  columnItems,
  renderCard,
  onDragEnd,
  getColumnId,
  onAddColumn,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeCol = getColumnId(activeId);

      const colEntry = columns.find((c) => c.id === overId);
      if (colEntry) {
        const targetItems = columnItems[colEntry.id] || [];
        const newIndex =
          activeCol === colEntry.id
            ? targetItems.length - 1
            : targetItems.length;
        onDragEnd(activeId, null, activeCol, colEntry.id, newIndex);
        return;
      }

      const overCol = getColumnId(overId);
      if (!overCol) return;

      const targetItems = columnItems[overCol] || [];
      const overIndex = targetItems.indexOf(overId);
      onDragEnd(activeId, overId, activeCol, overCol, overIndex >= 0 ? overIndex : targetItems.length);
    },
    [columns, columnItems, getColumnId, onDragEnd]
  );

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (trimmed) {
      const id = trimmed.toLowerCase().replace(/\s+/g, "-");
      onAddColumn?.(id, trimmed);
    }
    setNewName("");
    setAdding(false);
  }, [newName, onAddColumn]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleAdd();
      if (e.key === "Escape") {
        setNewName("");
        setAdding(false);
      }
    },
    [handleAdd]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 scrollbar-x pb-2">
        {columns.map((col) => {
          const items = columnItems[col.id] || [];
          return (
            <DroppableColumn key={col.id} id={col.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-(--font-family-head) text-sm font-extrabold text-primary-dark">
                  {col.label}
                </h3>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[0.7rem] font-bold text-primary-dark">
                  {items.length}
                </span>
              </div>

              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 min-h-[120px]">
                  {items.map((itemId) => (
                    <SortableItem key={itemId} id={itemId}>
                      {renderCard(itemId)}
                    </SortableItem>
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/50 p-6">
                      <p className="text-sm text-muted/60">Kosong</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}

        {onAddColumn && (
          <div
            className="flex shrink-0 flex-col rounded-2xl border-2 border-dashed border-border/50 bg-transparent p-4 transition-colors hover:border-primary/40"
            style={{ width: "var(--kanban-col-width, 320px)" }}
          >
            {adding ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAdd}
                  placeholder="Nama kolom..."
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-text outline-none transition-all focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-dark disabled:opacity-40"
                  >
                    Tambah
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewName(""); setAdding(false); }}
                    className="rounded-lg bg-surface-strong px-3 py-1.5 text-xs font-bold text-muted transition-all hover:text-text"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-6 text-sm font-bold text-muted transition-colors hover:bg-primary-soft/40 hover:text-primary-dark"
              >
                <Iconify icon="mingcute:add-line" width={20} />
                Tambah Kolom
              </button>
            )}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeId ? renderCard(activeId) : null}
      </DragOverlay>
    </DndContext>
  );
}
