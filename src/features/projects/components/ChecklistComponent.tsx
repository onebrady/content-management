'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Group,
  Text,
  TextInput,
  Button,
  ActionIcon,
  Checkbox,
  Progress,
  Menu,
  Avatar,
  Stack,
  Modal,
  Select,
} from '@mantine/core';
import {
  IconChecklist,
  IconPlus,
  IconDots,
  IconTrash,
  IconEdit,
  IconUser,
  IconGripVertical,
} from '@tabler/icons-react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { notifications } from '@mantine/notifications';
import { useDebouncedCallback } from '@mantine/hooks';
import classes from './ChecklistComponent.module.css';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Checklist {
  id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

interface ProjectMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ChecklistComponentProps {
  checklist: Checklist;
  projectMembers?: ProjectMember[];
  onUpdate?: (checklist: Checklist) => void;
  onDelete?: (checklistId: string) => void;
  onItemUpdate?: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onItemDelete?: (itemId: string) => void;
  onItemCreate?: (checklistId: string, text: string) => void;
  onItemReorder?: (checklistId: string, itemOrders: { id: string; position: number }[]) => void;
}

export function ChecklistComponent({
  checklist,
  projectMembers = [],
  onUpdate,
  onDelete,
  onItemUpdate,
  onItemDelete,
  onItemCreate,
  onItemReorder,
}: ChecklistComponentProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(checklist.title);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);

  // Calculate progress
  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Debounced auto-save for title changes
  const debouncedSaveTitle = useDebouncedCallback(async (newTitle: string) => {
    if (newTitle !== checklist.title && onUpdate) {
      try {
        const response = await fetch(`/api/checklists/${checklist.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error('Failed to update checklist title');
        }

        const updatedChecklist = await response.json();
        onUpdate(updatedChecklist);
        
        notifications.show({
          title: 'Success',
          message: 'Checklist title updated',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to update checklist title:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to update checklist title',
          color: 'red',
        });
      }
    }
  }, 1000);

  // Handle title change
  const handleTitleChange = useCallback((newTitle: string) => {
    setEditTitle(newTitle);
    debouncedSaveTitle(newTitle);
  }, [debouncedSaveTitle]);

  // Handle item completion toggle
  const handleItemToggle = useCallback(async (itemId: string, completed: boolean) => {
    if (onItemUpdate) {
      try {
        const response = await fetch(`/api/checklist-items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed }),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }

        const updatedItem = await response.json();
        onItemUpdate(itemId, { completed });
        
        notifications.show({
          title: completed ? 'Item completed' : 'Item marked incomplete',
          message: `"${updatedItem.text}" has been ${completed ? 'completed' : 'marked as incomplete'}`,
          color: completed ? 'green' : 'blue',
        });
      } catch (error) {
        console.error('Failed to update item:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to update item',
          color: 'red',
        });
      }
    }
  }, [onItemUpdate]);

  // Helper: provide a stable checkbox onChange handler for toggling item completion
  const createItemToggleHandler = useCallback(
    (itemId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      return handleItemToggle(itemId, event.currentTarget.checked);
    },
    [handleItemToggle]
  );

  // Handle adding new item
  const handleAddItem = useCallback(async () => {
    if (!newItemText.trim()) return;

    if (onItemCreate) {
      try {
        const response = await fetch(`/api/checklists/${checklist.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newItemText.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to create item');
        }

        onItemCreate(checklist.id, newItemText.trim());
        setNewItemText('');
        setIsAddingItem(false);
        
        notifications.show({
          title: 'Success',
          message: 'Checklist item added',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to create item:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to create item',
          color: 'red',
        });
      }
    }
  }, [checklist.id, newItemText, onItemCreate]);

  // Handle item text edit
  const handleItemEdit = useCallback(async (itemId: string) => {
    if (!editingItemText.trim()) return;

    if (onItemUpdate) {
      try {
        const response = await fetch(`/api/checklist-items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: editingItemText.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to update item text');
        }

        onItemUpdate(itemId, { text: editingItemText.trim() });
        setEditingItemId(null);
        setEditingItemText('');
        
        notifications.show({
          title: 'Success',
          message: 'Item updated',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to update item text:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to update item text',
          color: 'red',
        });
      }
    }
  }, [editingItemText, onItemUpdate]);

  // Handle item deletion
  const handleItemDelete = useCallback(async (itemId: string) => {
    if (onItemDelete) {
      try {
        const response = await fetch(`/api/checklist-items/${itemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        onItemDelete(itemId);
        
        notifications.show({
          title: 'Success',
          message: 'Item deleted',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to delete item:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete item',
          color: 'red',
        });
      }
    }
  }, [onItemDelete]);

  // Handle drag and drop reordering
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const items = Array.from(checklist.items);
    const fromIndex = items.findIndex((i) => i.id === activeId);
    const toIndex = items.findIndex((i) => i.id === overId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);

    const itemOrders = items.map((item, index) => ({ id: item.id, position: (index + 1) * 1000 }));
    onItemReorder?.(checklist.id, itemOrders);
  }, [checklist.items, checklist.id, onItemReorder]);

  // Handle assignee assignment
  const handleAssignMember = useCallback(async (memberId: string | null) => {
    if (!assigningItemId) return;

    if (onItemUpdate) {
      try {
        const response = await fetch(`/api/checklist-items/${assigningItemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assigneeId: memberId }),
        });

        if (!response.ok) {
          throw new Error('Failed to assign member');
        }

        const member = projectMembers.find(m => m.user.id === memberId);
        onItemUpdate(assigningItemId, { 
          assignee: member ? member.user : null 
        });
        
        setAssignModalOpen(false);
        setAssigningItemId(null);
        
        notifications.show({
          title: 'Success',
          message: memberId ? 'Member assigned' : 'Assignee removed',
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to assign member:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to assign member',
          color: 'red',
        });
      }
    }
  }, [assigningItemId, onItemUpdate, projectMembers]);

  return (
    <Box className={classes.checklistContainer}>
      {/* Checklist Header */}
      <Group justify="space-between" align="center" mb="xs">
        <Group align="center" gap="xs">
          <IconChecklist size={16} color="gray" />
          {isEditingTitle ? (
            <TextInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                handleTitleChange(editTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  handleTitleChange(editTitle);
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setEditTitle(checklist.title);
                }
              }}
              size="sm"
              variant="unstyled"
              className={classes.titleInput}
              autoFocus
            />
          ) : (
            <Text 
              size="sm" 
              fw={600} 
              className={classes.checklistTitle}
              onClick={() => setIsEditingTitle(true)}
            >
              {checklist.title}
            </Text>
          )}
          
          <Text size="sm" color="dimmed">
            {completedCount}/{totalCount}
          </Text>
        </Group>

        <Menu>
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => setIsEditingTitle(true)}
            >
              Rename checklist
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => onDelete?.(checklist.id)}
            >
              Delete checklist
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <Progress 
          value={progressPercentage} 
          size="sm" 
          mb="md"
          className={classes.progressBar}
          color={progressPercentage === 100 ? 'green' : 'blue'}
        />
      )}

      {/* Checklist Items */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className={classes.itemsContainer}>
          <SortableContext
            items={checklist.items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {checklist.items.map((item, index) => {
              const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
              const style: React.CSSProperties = {
                transform: CSS.Transform.toString(transform),
                transition,
              };
              return (
                <div
                  key={item.id}
                  ref={setNodeRef}
                  style={style}
                  className={`${classes.checklistItem} ${isDragging ? classes.dragging : ''}`}
                >
                  <Group align="flex-start" gap="xs" wrap="nowrap">
                    {/* Drag Handle */}
                    <div {...listeners} {...attributes} className={classes.dragHandle}>
                      <IconGripVertical size={14} color="gray" />
                    </div>

                        {/* Checkbox */}
                        <Checkbox
                          checked={item.completed}
                          onChange={createItemToggleHandler(item.id)}
                          className={classes.checkbox}
                        />

                        {/* Item Content */}
                        <Box flex={1}>
                          {editingItemId === item.id ? (
                            <TextInput
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              onBlur={() => handleItemEdit(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleItemEdit(item.id);
                                } else if (e.key === 'Escape') {
                                  setEditingItemId(null);
                                  setEditingItemText('');
                                }
                              }}
                              size="sm"
                              autoFocus
                            />
                          ) : (
                            <Group justify="space-between" align="center">
                              <Text
                                size="sm"
                                td={item.completed ? 'line-through' : undefined}
                                color={item.completed ? 'dimmed' : undefined}
                                className={classes.itemText}
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditingItemText(item.text);
                                }}
                              >
                                {item.text}
                              </Text>

                              <Group gap="xs">
                                {/* Assignee */}
                                {item.assignee ? (
                                  <Avatar
                                    size="xs"
                                    src={null}
                                    title={item.assignee.name}
                                    className={classes.assigneeAvatar}
                                    onClick={() => {
                                      setAssigningItemId(item.id);
                                      setAssignModalOpen(true);
                                    }}
                                  >
                                    {item.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                ) : (
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    onClick={() => {
                                      setAssigningItemId(item.id);
                                      setAssignModalOpen(true);
                                    }}
                                  >
                                    <IconUser size={12} />
                                  </ActionIcon>
                                )}

                                {/* Delete Item */}
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleItemDelete(item.id)}
                                >
                                  <IconTrash size={12} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          )}
                        </Box>
                      </Group>
                  </Group>
                </div>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>

      {/* Add Item Section */}
      <Box mt="xs">
        {isAddingItem ? (
          <Stack gap="xs">
            <TextInput
              placeholder="Add an item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                } else if (e.key === 'Escape') {
                  setIsAddingItem(false);
                  setNewItemText('');
                }
              }}
              size="sm"
              autoFocus
            />
            <Group gap="xs">
              <Button size="xs" onClick={handleAddItem} disabled={!newItemText.trim()}>
                Add item
              </Button>
              <Button 
                size="xs" 
                variant="subtle"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                }}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        ) : (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPlus size={14} />}
            onClick={() => setIsAddingItem(true)}
            size="sm"
            className={classes.addItemButton}
          >
            Add an item
          </Button>
        )}
      </Box>

      {/* Assign Member Modal */}
      <Modal
        opened={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssigningItemId(null);
        }}
        title="Assign member"
        size="sm"
      >
        <Stack gap="md">
          <Select
            label="Select member"
            placeholder="Choose a team member"
            data={[
              { value: '', label: 'No assignee' },
              ...projectMembers.map(member => ({
                value: member.user.id,
                label: member.user.name,
              }))
            ]}
            onChange={(value) => handleAssignMember(value)}
            clearable
          />
        </Stack>
      </Modal>
    </Box>
  );
}
