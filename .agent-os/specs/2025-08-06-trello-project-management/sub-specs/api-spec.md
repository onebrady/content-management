# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-06-trello-project-management/spec.md

## Board Management Endpoints

### GET /api/projects/[projectId]/board

**Purpose:** Get complete board data with lists and cards
**Parameters:**

- `projectId` (path): Project ID
- `include` (query, optional): Comma-separated list (members,activities,labels)
  **Response:** Board object with nested lists and cards
  **Errors:** 404 (board not found), 403 (access denied)

### PATCH /api/projects/[projectId]

**Purpose:** Update board properties (title, description, background, visibility)
**Parameters:**

- `projectId` (path): Project ID
- Body: `{ title?, description?, background?, visibility?, starred? }`
  **Response:** Updated project object
  **Errors:** 400 (validation error), 404 (not found), 403 (unauthorized)

### POST /api/projects/[projectId]/star

**Purpose:** Star/unstar a board for quick access
**Parameters:**

- `projectId` (path): Project ID
- Body: `{ starred: boolean }`
  **Response:** `{ starred: boolean }`
  **Errors:** 404 (board not found), 403 (access denied)

## List Management Endpoints

### GET /api/projects/[projectId]/lists

**Purpose:** Get all lists for a board with cards
**Parameters:**

- `projectId` (path): Project ID
- `includeArchived` (query, optional): Include archived lists
  **Response:** Array of list objects with nested cards
  **Errors:** 404 (board not found), 403 (access denied)

### POST /api/projects/[projectId]/lists

**Purpose:** Create new list in board
**Parameters:**

- `projectId` (path): Project ID
- Body: `{ title: string, position?: number }`
  **Response:** Created list object
  **Errors:** 400 (validation error), 403 (access denied)

### PATCH /api/lists/[listId]

**Purpose:** Update list properties
**Parameters:**

- `listId` (path): List ID
- Body: `{ title?, position?, archived? }`
  **Response:** Updated list object
  **Errors:** 400 (validation error), 404 (not found), 403 (unauthorized)

### PATCH /api/projects/[projectId]/lists/reorder

**Purpose:** Reorder multiple lists at once
**Parameters:**

- `projectId` (path): Project ID
- Body: `{ listOrders: Array<{ id: string, position: number }> }`
  **Response:** Array of updated list objects
  **Errors:** 400 (validation error), 403 (access denied)

## Card Management Endpoints

### GET /api/cards/[cardId]

**Purpose:** Get detailed card information
**Parameters:**

- `cardId` (path): Card ID
- `include` (query, optional): Comma-separated list (checklists,attachments,comments,activities)
  **Response:** Complete card object with requested relationships
  **Errors:** 404 (card not found), 403 (access denied)

### POST /api/lists/[listId]/cards

**Purpose:** Create new card in list
**Parameters:**

- `listId` (path): List ID
- Body: `{ title: string, description?, position?, dueDate?, assigneeIds?: string[] }`
  **Response:** Created card object
  **Errors:** 400 (validation error), 403 (access denied)

### PATCH /api/cards/[cardId]

**Purpose:** Update card properties
**Parameters:**

- `cardId` (path): Card ID
- Body: `{ title?, description?, dueDate?, completed?, cover?, assigneeIds? }`
  **Response:** Updated card object
  **Errors:** 400 (validation error), 404 (not found), 403 (unauthorized)

### POST /api/cards/[cardId]/move

**Purpose:** Move card between lists or reorder within list
**Parameters:**

- `cardId` (path): Card ID
- Body: `{ destinationListId: string, position: number }`
  **Response:** Updated card object with new position
  **Errors:** 400 (validation error), 404 (not found), 403 (unauthorized)

## Checklist Management Endpoints

### POST /api/cards/[cardId]/checklists

**Purpose:** Create new checklist on card
**Parameters:**

- `cardId` (path): Card ID
- Body: `{ title: string, items?: Array<{ text: string }> }`
  **Response:** Created checklist object with items
  **Errors:** 400 (validation error), 403 (access denied)

### PATCH /api/checklists/[checklistId]/items/[itemId]

**Purpose:** Update checklist item (toggle completion, edit text)
**Parameters:**

- `checklistId` (path): Checklist ID
- `itemId` (path): Item ID
- Body: `{ completed?, text?, assigneeId? }`
  **Response:** Updated checklist item
  **Errors:** 400 (validation error), 404 (not found), 403 (unauthorized)

## Attachment Management Endpoints

### POST /api/cards/[cardId]/attachments

**Purpose:** Upload file attachment to card
**Parameters:**

- `cardId` (path): Card ID
- Body: FormData with file upload
  **Response:** Created attachment object with URL
  **Errors:** 400 (file too large/invalid type), 403 (access denied)

### DELETE /api/attachments/[attachmentId]

**Purpose:** Remove attachment from card
**Parameters:**

- `attachmentId` (path): Attachment ID
  **Response:** `{ deleted: true }`
  **Errors:** 404 (not found), 403 (unauthorized)

## Real-time WebSocket Events

### Connection: `/api/socket/boards/[projectId]`

**Purpose:** Real-time board updates for collaborative editing

**Outgoing Events (Server → Client):**

- `card:moved` - Card moved between lists
- `card:updated` - Card properties changed
- `card:created` - New card added
- `card:deleted` - Card removed
- `list:updated` - List properties changed
- `list:created` - New list added
- `user:joined` - User joined board
- `user:left` - User left board

**Incoming Events (Client → Server):**

- `join:board` - Join board room for updates
- `leave:board` - Leave board room
- `card:move` - Move card with optimistic update

## Activity Tracking

### GET /api/projects/[projectId]/activities

**Purpose:** Get board activity feed
**Parameters:**

- `projectId` (path): Project ID
- `limit` (query, optional): Number of activities (default: 50)
- `cursor` (query, optional): Pagination cursor
  **Response:** Array of activity objects with user and timestamp
  **Errors:** 404 (board not found), 403 (access denied)

### POST /api/activities

**Purpose:** Create activity entry (automated by other endpoints)
**Parameters:**

- Body: `{ action: ProjectActivityAction, projectId?, cardId?, data: object }`
  **Response:** Created activity object
  **Errors:** 400 (validation error), 403 (unauthorized)

## Error Handling Standards

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": {
      "field": "specific validation failures"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Request validation failed
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Operation conflicts with current state
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
