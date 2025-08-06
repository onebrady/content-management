# Project Management System - AI Agent Implementation Guide

## Critical Context
- **Stack**: Next.js 15, Mantine 8.2, TanStack Query 5, Prisma, Zustand
- **Target**: Lightweight Kanban system under 100kb additional bundle
- **Philosophy**: Use existing dependencies, lazy load everything heavy

## Required New Dependencies (15kb total)

```bash
# ONLY add these - you have everything else needed
npm install @dnd-kit/core@6.1.0 @dnd-kit/sortable@8.0.0
```

## Database Schema

```prisma
// Add to your existing schema.prisma

model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  color       String   @default("blue")
  archived    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  columns     Column[]
  members     ProjectMember[]
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  @@index([ownerId, archived])
  @@index([updatedAt])
}

model Column {
  id        String   @id @default(cuid())
  title     String
  position  Int
  color     String   @default("gray")
  
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks     Task[]

  @@index([projectId, position])
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  position    Int
  priority    String    @default("MEDIUM")
  dueDate     DateTime?
  completed   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  columnId    String
  column      Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  assigneeId  String?
  assignee    User?     @relation(fields: [assigneeId], references: [id])

  @@index([columnId, position])
  @@index([assigneeId])
}

model ProjectMember {
  id        String   @id @default(cuid())
  role      String   @default("MEMBER")
  
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  @@unique([projectId, userId])
}
```

## File Structure

```
src/
├── features/
│   └── projects/
│       ├── components/
│       │   ├── ProjectBoard.tsx
│       │   ├── TaskCard.tsx
│       │   └── TaskModal.tsx
│       ├── hooks/
│       │   ├── useProjectData.ts
│       │   └── useTaskMutations.ts
│       └── api/
│           └── projectApi.ts
└── app/
    ├── api/
    │   └── projects/
    │       └── [...routes].ts
    └── projects/
        └── [id]/
            └── page.tsx
```

## Core Implementation

### 1. TanStack Query Setup (Using Your Existing Config)

```typescript
// features/projects/hooks/useProjectData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetch(`/api/projects/${id}`).then(r => r.json()),
    staleTime: 30_000,
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, ...data }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onMutate: async ({ taskId, projectId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) })
      
      const previous = queryClient.getQueryData(projectKeys.detail(projectId))
      
      queryClient.setQueryData(projectKeys.detail(projectId), (old: any) => ({
        ...old,
        columns: old.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        }))
      }))
      
      return { previous, projectId }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.detail(context.projectId), 
          context.previous
        )
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(variables.projectId) 
      })
    },
  })
}
```

### 2. Minimal Drag & Drop Implementation

```typescript
// features/projects/components/ProjectBoard.tsx
import { DndContext, closestCorners, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Stack, Paper, Title } from '@mantine/core'
import { useUpdateTask } from '../hooks/useProjectData'

export function ProjectBoard({ project }) {
  const updateTask = useUpdateTask()
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const taskId = active.id as string
    const targetColumnId = over.data.current?.columnId
    const targetPosition = over.data.current?.position || 0
    
    updateTask.mutate({
      taskId,
      projectId: project.id,
      columnId: targetColumnId,
      position: targetPosition,
    })
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <Stack direction="horizontal" spacing="md">
        {project.columns.map(column => (
          <Paper key={column.id} p="md" w={300}>
            <Title order={5} mb="sm">{column.title}</Title>
            <SortableContext 
              items={column.tasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing="xs">
                {column.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Stack>
            </SortableContext>
          </Paper>
        ))}
      </Stack>
    </DndContext>
  )
}
```

### 3. Optimized Task Card

```typescript
// features/projects/components/TaskCard.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Text, Badge, Group } from '@mantine/core'

export function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
    useSortable({ id: task.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      shadow="sm"
      p="xs"
    >
      <Text size="sm" fw={500}>{task.title}</Text>
      {task.priority !== 'MEDIUM' && (
        <Badge size="xs" color={task.priority === 'HIGH' ? 'red' : 'blue'}>
          {task.priority}
        </Badge>
      )}
    </Card>
  )
}
```

### 4. API Routes (Optimized for Edge)

```typescript
// app/api/projects/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              position: true,
              priority: true,
              completed: true,
              assigneeId: true,
            }
          }
        }
      }
    }
  })
  
  return NextResponse.json(project)
}
```

### 5. Lazy Load Heavy Components

```typescript
// features/projects/components/TaskModal.tsx
import dynamic from 'next/dynamic'

// Only load TipTap when editing description
const RichTextEditor = dynamic(
  () => import('@tiptap/react').then(mod => mod.EditorContent),
  { 
    ssr: false,
    loading: () => <div style={{ height: 200 }}>Loading editor...</div>
  }
)

// Only load charts when viewing analytics
const ProjectCharts = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
)
```

## Performance Optimizations

### 1. Bundle Configuration

```javascript
// next.config.js - Add to your existing config
module.exports = {
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@tabler/icons-react'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Move drag-and-drop to async chunk
      config.optimization.splitChunks.cacheGroups.dndkit = {
        test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
        name: 'dnd-kit',
        priority: 20,
        chunks: 'async',
      }
    }
    return config
  },
}
```

### 2. Zustand Store (Minimal UI State Only)

```typescript
// features/projects/store.ts
import { create } from 'zustand'

interface ProjectUIStore {
  selectedTaskId: string | null
  isTaskModalOpen: boolean
  draggedTaskId: string | null
  
  setSelectedTask: (id: string | null) => void
  toggleTaskModal: () => void
  setDraggedTask: (id: string | null) => void
}

export const useProjectUI = create<ProjectUIStore>((set) => ({
  selectedTaskId: null,
  isTaskModalOpen: false,
  draggedTaskId: null,
  
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  toggleTaskModal: () => set((s) => ({ isTaskModalOpen: !s.isTaskModalOpen })),
  setDraggedTask: (id) => set({ draggedTaskId: id }),
}))
```

## Implementation Checklist

### Phase 1: Core (Day 1-2)
- [ ] Run Prisma migration for new models
- [ ] Install @dnd-kit dependencies only
- [ ] Create basic board component with existing Mantine
- [ ] Set up TanStack Query hooks
- [ ] Implement drag & drop

### Phase 2: Optimization (Day 3)
- [ ] Add optimistic updates
- [ ] Configure lazy loading for TipTap
- [ ] Add keyboard shortcuts
- [ ] Mobile responsive design

### Phase 3: Polish (Day 4-5)
- [ ] Add search/filter (use existing Mantine components)
- [ ] Implement task quick actions
- [ ] Add loading states
- [ ] Performance monitoring

## Key Decisions

### What to Use from Existing Stack
- **Mantine**: All UI components (Card, Paper, Stack, Modal, etc.)
- **TanStack Query**: All data fetching and caching
- **Zustand**: Minimal UI state only
- **TipTap**: Rich text (lazy loaded)
- **Dayjs**: All date operations (you already have it)
- **React Hook Form + Zod**: All forms

### What NOT to Add
- ❌ No additional UI libraries
- ❌ No react-beautiful-dnd (use @dnd-kit instead)
- ❌ No additional state management
- ❌ No additional date libraries
- ❌ No additional form libraries

### Performance Targets
- Initial board load: < 50kb additional JS
- Drag operation: < 16ms response
- Task update: < 100ms perceived (optimistic)
- Total feature size: < 100kb gzipped

## Common Pitfalls to Avoid

1. **Don't eagerly load TipTap** - It's 100kb+, lazy load it
2. **Don't create duplicate date utilities** - Use dayjs everywhere
3. **Don't add new form libraries** - Use react-hook-form
4. **Don't store server data in Zustand** - Use TanStack Query
5. **Don't bundle charts initially** - Lazy load recharts

## Testing Approach

```typescript
// Simple smoke test for board
describe('ProjectBoard', () => {
  it('renders columns and tasks', async () => {
    render(<ProjectBoard project={mockProject} />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })
  
  it('handles drag and drop', async () => {
    const { rerender } = render(<ProjectBoard project={mockProject} />)
    // Simulate drag
    fireEvent.dragStart(screen.getByText('Task 1'))
    fireEvent.drop(screen.getByText('In Progress'))
    // Verify optimistic update
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalled()
    })
  })
})
```

## Monitoring Success

```bash
# Check bundle size impact
npm run build
# Should show: Route (app) Size First Load JS
# /projects/[id] should add < 50kb to First Load

# Verify no duplicate dependencies
npm ls dayjs  # Should show only one version
npm ls @mantine/core  # Should show only one version
```