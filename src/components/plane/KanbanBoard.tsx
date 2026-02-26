"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Star,
  Target,
  GripVertical,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";

// --- Types ---

export interface KanbanIssue {
  id: string;
  sequence_id: number;
  name: string;
  target_date: string | null;
  stateName: string;
  stateGroup: string;
  stateId: string;
  labelNames: { name: string; color: string }[];
  priority: string | null;
}

export interface KanbanColumn {
  id: string;
  stateId: string;
  title: string;
  group: string;
  color: string;
  icon: typeof CheckCircle2;
  issues: KanbanIssue[];
}

interface Props {
  columns: KanbanColumn[];
  prefix: string;
  projectId: string;
  onMoveIssue: (issueId: string, newStateId: string) => void;
}

// --- Helpers ---

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
}

function priorityColor(p: string | null) {
  if (p === "urgent") return "border-l-red-500";
  if (p === "high") return "border-l-orange-400";
  if (p === "medium") return "border-l-blue-400";
  return "border-l-gray-200";
}

// --- Sortable Card ---

function SortableCard({
  issue,
  prefix,
  isDragging,
}: {
  issue: KanbanIssue;
  prefix: string;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const type = issue.labelNames.find(
    (l) => l.name === "milestone" || l.name === "goal"
  )?.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-border border-l-4 ${priorityColor(
        issue.priority
      )} bg-white p-3 shadow-sm touch-manipulation`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-gray-500 touch-manipulation cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {type === "milestone" && (
              <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
            )}
            {type === "goal" && (
              <Target className="h-3 w-3 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-[10px] text-muted font-mono">
              {prefix}-{issue.sequence_id}
            </span>
          </div>
          <div className="text-sm font-medium text-foreground leading-snug">
            {issue.name}
          </div>
          {issue.target_date && (
            <div className="mt-1 text-[10px] text-muted">
              {formatDate(issue.target_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Drag Overlay Card (follows cursor) ---

function OverlayCard({
  issue,
  prefix,
}: {
  issue: KanbanIssue;
  prefix: string;
}) {
  const type = issue.labelNames.find(
    (l) => l.name === "milestone" || l.name === "goal"
  )?.name;

  return (
    <div
      className={`rounded-lg border-2 border-primary border-l-4 ${priorityColor(
        issue.priority
      )} bg-white p-3 shadow-lg w-[260px] rotate-2`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {type === "milestone" && (
              <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
            )}
            {type === "goal" && (
              <Target className="h-3 w-3 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-[10px] text-muted font-mono">
              {prefix}-{issue.sequence_id}
            </span>
          </div>
          <div className="text-sm font-medium text-foreground leading-snug">
            {issue.name}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Column ---

function Column({
  column,
  prefix,
  activeId,
}: {
  column: KanbanColumn;
  prefix: string;
  activeId: string | null;
}) {
  const Icon = column.icon;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-shrink-0">
      {/* Column header */}
      <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 bg-white border border-border">
        <Icon className="h-4 w-4" style={{ color: column.color }} />
        <span className="text-sm font-semibold text-foreground">
          {column.title}
        </span>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted">
          {column.issues.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-gray-50/50 p-2 min-h-[200px]">
        <SortableContext
          items={column.issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.issues.map((issue) => (
            <SortableCard
              key={issue.id}
              issue={issue}
              prefix={prefix}
              isDragging={activeId === issue.id}
            />
          ))}
        </SortableContext>
        {column.issues.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted">
            Prázdné
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Kanban Board ---

export default function KanbanBoard({
  columns: initialColumns,
  prefix,
  projectId,
  onMoveIssue,
}: Props) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    })
  );

  // Find issue across all columns
  const findIssue = useCallback(
    (id: string): KanbanIssue | undefined => {
      for (const col of columns) {
        const issue = col.issues.find((i) => i.id === id);
        if (issue) return issue;
      }
      return undefined;
    },
    [columns]
  );

  const findColumnByIssueId = useCallback(
    (id: string): KanbanColumn | undefined => {
      return columns.find((col) => col.issues.some((i) => i.id === id));
    },
    [columns]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIssueId = active.id as string;
    const overId = over.id as string;

    const sourceCol = findColumnByIssueId(activeIssueId);
    if (!sourceCol) return;

    // Determine target column
    let targetCol = columns.find((c) => c.id === overId);
    if (!targetCol) {
      targetCol = findColumnByIssueId(overId);
    }
    if (!targetCol || sourceCol.id === targetCol.id) return;

    // Move issue
    const issue = sourceCol.issues.find((i) => i.id === activeIssueId);
    if (!issue) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceCol.id) {
          return {
            ...col,
            issues: col.issues.filter((i) => i.id !== activeIssueId),
          };
        }
        if (col.id === targetCol!.id) {
          return {
            ...col,
            issues: [
              ...col.issues,
              { ...issue, stateGroup: col.group, stateName: col.title, stateId: col.stateId },
            ],
          };
        }
        return col;
      })
    );

    // Write back to Plane
    onMoveIssue(activeIssueId, targetCol.stateId);
  }

  const activeIssue = activeId ? findIssue(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            prefix={prefix}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? (
          <OverlayCard issue={activeIssue} prefix={prefix} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
