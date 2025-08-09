'use client';

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Paper,
  Stack,
  Group,
  Title,
  Badge,
  Button,
  Text,
  Menu,
  ActionIcon,
} from '@mantine/core';
import {
  IconDots,
  IconArchive,
  IconTrash,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';

export interface StatusDef {
  id: string;
  title: string;
  color: string;
}

function normalizeStatusId(input?: string): string {
  if (!input) return 'planning';
  const s = String(input)
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
  if (['planning', 'in-progress', 'review', 'completed'].includes(s)) return s;
  if (s.includes('progress')) return 'in-progress';
  if (s.includes('review')) return 'review';
  if (s.includes('complete')) return 'completed';
  return 'planning';
}

interface BoardDndKitProps {
  statuses: StatusDef[];
  grouped: Record<string, any[]>; // projects by status id
  onMove: (args: {
    projectId: string;
    fromStatus: string;
    toStatus: string;
    fromIndex: number;
    toIndex: number;
  }) => void;
  onClickProject?: (project: any) => void;
  onArchiveProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
  onAddProject?: (statusId: string) => void;
  onEditColumn?: (status: StatusDef) => void;
  onDeleteColumn?: (statusId: string) => void;
}

function SortableCard({
  project,
  statusId,
  onClick,
  onArchive,
  onDelete,
  draggingActiveId,
  draggingFromId,
}: {
  project: any;
  statusId: string;
  onClick?: (p: any) => void;
  onArchive?: (p: any) => void;
  onDelete?: (p: any) => void;
  draggingActiveId?: string | null;
  draggingFromId?: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: { type: 'card', statusId, projectId: project.id },
  });

  const shouldHideSource =
    isDragging &&
    draggingActiveId === project.id &&
    draggingFromId === statusId;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide only the source instance while dragging; destination remains visible
    opacity: shouldHideSource ? 0 : 1,
    cursor: 'grab',
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 1000 : undefined,
    pointerEvents: isDragging ? 'none' : undefined,
  };

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid={`draggable-${project.id}`}
      p="md"
      withBorder
      shadow="sm"
      style={style}
      onClick={() => onClick?.(project)}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs" style={{ flex: 1 }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: project.color || '#3b82f6',
                flexShrink: 0,
              }}
            />
            <Text fw={500} size="sm" lineClamp={2} style={{ flex: 1 }}>
              {project.title}
            </Text>
          </Group>
          <Menu withinPortal position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item
                leftSection={<IconArchive size={14} />}
                onClick={() => onArchive?.(project)}
              >
                {project.archived ? 'Unarchive' : 'Archive'}
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onDelete?.(project)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        {project.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {project.description}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

function DroppableColumnArea({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  });
  return (
    <Stack
      gap="sm"
      style={{
        flex: 1,
        minHeight: 300,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
      ref={setNodeRef}
    >
      {children}
    </Stack>
  );
}

export function BoardDndKit({
  statuses,
  grouped,
  onMove,
  onClickProject,
  onArchiveProject,
  onDeleteProject,
  onAddProject,
  onEditColumn,
  onDeleteColumn,
}: BoardDndKitProps) {
  // Local mirror for responsive reorder feedback
  const [itemsByCol, setItemsByCol] = useState<Record<string, any[]>>(() => {
    const obj: Record<string, any[]> = {};
    statuses.forEach((s) => (obj[s.id] = [...(grouped[s.id] || [])]));
    return obj;
  });

  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFrom, setActiveFrom] = useState<string | null>(null);
  const lastPreviewRef = useRef<{
    activeId: string;
    overId: string;
    from: string;
    to: string;
    toIndex: number;
  } | null>(null);
  const [preview, setPreview] = useState<{
    activeId: string;
    to: string;
    toIndex: number;
  } | null>(null);

  // Keep in sync if props change significantly
  // Keep itemsByCol in sync when inputs change
  useEffect(() => {
    if (activeProject) return; // don't reset preview state while dragging
    const obj: Record<string, any[]> = {};
    statuses.forEach((s) => (obj[s.id] = [...(grouped[s.id] || [])]));
    setItemsByCol(obj);
  }, [grouped, statuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findContainerOf = useCallback(
    (cardId: string): string | null => {
      for (const s of statuses) {
        if ((itemsByCol[s.id] || []).some((p) => p.id === cardId)) return s.id;
      }
      return null;
    },
    [itemsByCol, statuses]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const from = findContainerOf(activeId);
      const overType = (over.data?.current as any)?.type;
      const to =
        overType === 'column'
          ? overId
          : statuses.find((s) => s.id === overId)
            ? overId
            : findContainerOf(overId);
      if (!from || !to) return;

      const toList = itemsByCol[to] || [];
      let targetIndex = -1;
      if (from === to) {
        const overIdxSame = toList.findIndex((p) => p.id === overId);
        const fromIndex = (itemsByCol[from] || []).findIndex(
          (p) => p.id === activeId
        );
        targetIndex = overIdxSame === -1 ? fromIndex : overIdxSame;
      } else {
        const overIdxOther = toList.findIndex((p) => p.id === overId);
        targetIndex = overIdxOther === -1 ? toList.length : overIdxOther;
      }

      const last = lastPreviewRef.current;
      if (
        last &&
        last.activeId === activeId &&
        last.overId === overId &&
        last.from === from &&
        last.to === to &&
        last.toIndex === targetIndex
      ) {
        return; // no-op if preview unchanged
      }
      lastPreviewRef.current = {
        activeId,
        overId,
        from,
        to,
        toIndex: targetIndex,
      };
      setPreview((prevSt) => {
        if (
          prevSt &&
          prevSt.activeId === activeId &&
          prevSt.to === to &&
          prevSt.toIndex === targetIndex
        )
          return prevSt;
        return { activeId, to, toIndex: targetIndex };
      });
    },
    [findContainerOf, statuses, itemsByCol]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveProject(null);
        return;
      }
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromStatus = findContainerOf(activeId);
      const overType = (over.data?.current as any)?.type;
      const toStatus =
        overType === 'column'
          ? overId
          : statuses.find((s) => s.id === overId)
            ? overId
            : findContainerOf(overId);
      if (!fromStatus || !toStatus) {
        setActiveProject(null);
        return;
      }

      // Compute indices from current local lists
      setItemsByCol((prev) => {
        const fromList = [...(prev[fromStatus] || [])];
        const toList = [...(prev[toStatus] || [])];
        const fromIndex = fromList.findIndex((p) => p.id === activeId);
        let toIndex = toList.findIndex((p) => p.id === overId);
        if (toIndex === -1) toIndex = toList.length;

        // If same container, normalize toIndex for downward move
        if (fromStatus === toStatus && toIndex > fromIndex) {
          toIndex = Math.max(0, toIndex - 1);
        }

        try {
          onMove({
            projectId: activeId,
            fromStatus,
            toStatus,
            fromIndex,
            toIndex,
          });
        } catch {}

        // Keep local feedback; server will refetch and realign
        if (fromStatus === toStatus) {
          return {
            ...prev,
            [fromStatus]: arrayMove(toList, fromIndex, toIndex),
          };
        }
        // Cross-container: remove and insert
        const newFrom = fromList.filter((p) => p.id !== activeId);
        const moved = (prev[fromStatus] || []).find((p) => p.id === activeId);
        const newTo = [...toList];
        if (moved) newTo.splice(toIndex, 0, moved);
        return { ...prev, [fromStatus]: newFrom, [toStatus]: newTo };
      });
      setActiveProject(null);
      setActiveId(null);
      setActiveFrom(null);
      lastPreviewRef.current = null;
      setPreview(null);
    },
    [findContainerOf, onMove, statuses]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => {
        const id = String(e.active.id);
        const colId = findContainerOf(id);
        const p = colId
          ? (itemsByCol[colId] || []).find((x) => x.id === id)
          : null;
        setActiveProject(p || null);
        setActiveId(id);
        setActiveFrom(colId || null);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="board-dnd-kit"
        data-e2e-board
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'nowrap',
          alignItems: 'flex-start',
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: 20,
        }}
      >
        {statuses.map((status) => {
          let localItems = itemsByCol[status.id] || [];
          // Safety: if local list is empty right after drop, fall back to props
          if (!activeProject && (!localItems || localItems.length === 0)) {
            localItems = grouped[status.id] || [];
          }
          const items = localItems.map((p) => ({
            ...p,
            status: normalizeStatusId(p.status),
          }));
          const gapIndex =
            preview && preview.to === status.id
              ? Math.max(0, Math.min(preview.toIndex, items.length))
              : -1;
          return (
            <Paper
              key={status.id}
              withBorder
              radius="md"
              className="droppableColumn"
              style={{
                flex: '0 0 320px',
                minWidth: 320,
                width: 320,
                minHeight: 500,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--mantine-color-gray-0)',
              }}
              p="md"
              data-testid={`column-${status.id}`}
              data-e2e-column-id={status.id}
            >
              <Group justify="space-between" align="center" mb="md">
                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: status.color,
                      flexShrink: 0,
                    }}
                  />
                  <Title order={4} fw={600} style={{ flex: 1 }}>
                    {status.title}
                  </Title>
                </Group>
                <Group gap="xs">
                  <Badge variant="light" size="sm">
                    {items.length}
                  </Badge>
                  <Menu withinPortal position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => {
                          const next = window.prompt(
                            'Rename list',
                            status.title
                          );
                          if (next && next.trim()) {
                            onEditColumn?.({ ...status, title: next.trim() });
                          }
                        }}
                      >
                        Rename list
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        disabled={items.length > 0}
                        onClick={() =>
                          items.length === 0 && onDeleteColumn?.(status.id)
                        }
                      >
                        Delete list{items.length > 0 ? ' (empty only)' : ''}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              <SortableContext
                items={items.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumnArea columnId={status.id}>
                  {items.map((project, index) => (
                    <React.Fragment key={`frag-${project.id}`}>
                      {gapIndex === index && (
                        <div
                          key={`placeholder-${status.id}-${index}`}
                          style={{
                            height: 80,
                            marginBottom: 8,
                            border: '2px dashed var(--mantine-color-gray-4)',
                            borderRadius: 8,
                            background: 'var(--mantine-color-gray-1)',
                          }}
                        />
                      )}
                      <SortableCard
                        key={project.id}
                        project={project}
                        statusId={status.id}
                        onClick={onClickProject}
                        onArchive={onArchiveProject}
                        onDelete={onDeleteProject}
                        draggingActiveId={activeId}
                        draggingFromId={activeFrom}
                      />
                    </React.Fragment>
                  ))}
                  {gapIndex === items.length && (
                    <div
                      key={`placeholder-${status.id}-end`}
                      style={{
                        height: 80,
                        marginTop: 8,
                        border: '2px dashed var(--mantine-color-gray-4)',
                        borderRadius: 8,
                        background: 'var(--mantine-color-gray-1)',
                      }}
                    />
                  )}
                </DroppableColumnArea>
              </SortableContext>

              <Button
                variant="subtle"
                size="sm"
                fullWidth
                style={{
                  marginTop: 8,
                  color: 'var(--mantine-color-gray-6)',
                  justifyContent: 'flex-start',
                }}
                onClick={() => onAddProject?.(status.id)}
              >
                Add a project
              </Button>
            </Paper>
          );
        })}
      </div>
      <DragOverlay>
        {activeProject ? (
          <Paper
            p="md"
            withBorder
            shadow="lg"
            style={{ pointerEvents: 'none', zIndex: 2000 }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Group gap="xs" style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: activeProject.color || '#3b82f6',
                      flexShrink: 0,
                    }}
                  />
                  <Text fw={500} size="sm" style={{ flex: 1 }}>
                    {activeProject.title}
                  </Text>
                </Group>
              </Group>
              {activeProject.description && (
                <Text size="xs" c="dimmed">
                  {activeProject.description}
                </Text>
              )}
            </Stack>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default BoardDndKit;
