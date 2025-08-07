# API Integration Specification

This is the API integration specification for the spec detailed in @.agent-os/specs/2025-08-06-project-management-integration/spec.md

## API Endpoint Updates

### Project Board Data Retrieval

#### GET /api/projects/[id]/board

**Purpose:** Replace old project data structure with new board-compatible format
**Response Format:**

```json
{
  "project": {
    "id": "string",
    "title": "string",
    "description": "string",
    "background": "string",
    "visibility": "PRIVATE|TEAM|PUBLIC",
    "starred": boolean,
    "lists": [
      {
        "id": "string",
        "title": "string",
        "position": number,
        "archived": boolean,
        "color": "string",
        "cards": [
          {
            "id": "string",
            "title": "string",
            "description": "string",
            "position": number,
            "dueDate": "string|null",
            "assignees": ["userId1", "userId2"],
            "labels": ["labelId1"],
            "checklists": [],
            "attachments": []
          }
        ]
      }
    ],
    "members": [],
    "labels": []
  }
}
```

#### GET /api/projects (Updated)

**Purpose:** Return projects with new schema structure for list view
**Updates:**

- Include `lists` count instead of `columns` count
- Include `cards` count instead of `tasks` count
- Add new project fields (background, visibility, starred)

### Legacy Endpoint Deprecation

#### Routes to Remove

- `GET /api/projects/[id]/columns` - Replaced by board endpoint
- `POST /api/projects/[id]/columns` - Replaced by lists creation
- `GET/PATCH/DELETE /api/columns/[id]` - Replaced by list management
- `GET/POST /api/tasks` - Replaced by card management
- `GET/PATCH/DELETE /api/tasks/[id]` - Replaced by card endpoints

#### Routes to Update

- `GET/PATCH/DELETE /api/projects/[id]` - Update to work with new schema
- `GET/POST /api/projects/[id]/members` - Maintain existing functionality

### New Endpoint Integration

#### Board Management

- `GET /api/projects/[id]/board` - Main board data endpoint
- `POST /api/projects/[id]/lists` - Create new lists
- `PATCH /api/lists/[id]` - Update list properties
- `PATCH /api/projects/[id]/lists/reorder` - Reorder lists

#### Card Management

- `POST /api/lists/[id]/cards` - Create cards in lists
- `GET/PATCH /api/cards/[id]` - Card CRUD operations
- `POST /api/cards/[id]/move` - Handle drag-and-drop moves

#### Real-time Integration

- `GET/POST /api/socket` - WebSocket server management
- Integration with all board operations for live updates

## Response Format Standardization

### Error Response Format

```json
{
  "error": "string",
  "message": "string",
  "code": "PROJECT_NOT_FOUND|INSUFFICIENT_PERMISSIONS|VALIDATION_ERROR",
  "details": {}
}
```

### Success Response Format

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

## Authentication and Authorization

### Existing Permission System

- Maintain current role-based access (VIEWER, CONTRIBUTOR, MODERATOR, ADMIN)
- Preserve project ownership and membership validation
- Keep existing authentication middleware

### New Permission Checks

- Verify access to ProjectList and ProjectCard resources
- Validate real-time collaboration permissions
- Ensure proper access control for new features (labels, checklists)

## Migration Compatibility

### Backward Compatibility Period

- Support both old and new API formats during migration
- Gracefully handle requests to deprecated endpoints
- Provide clear migration path for API consumers

### Data Format Translation

- Automatically convert old column/task responses to new list/card format
- Ensure existing API clients continue to work during transition
- Provide migration warnings in response headers

## Performance Optimization

### Database Query Optimization

- Use efficient joins for nested list/card data
- Implement proper indexing for new relationships
- Optimize real-time event queries

### Caching Strategy

- Cache project board data for faster load times
- Implement incremental updates for real-time changes
- Use Redis for WebSocket session management

### Rate Limiting

- Implement rate limits for real-time collaboration events
- Protect against excessive card movement operations
- Monitor and limit WebSocket connection frequency

## API Testing Strategy

### Integration Tests

- Test all new endpoint functionality
- Verify data migration compatibility
- Test real-time collaboration features

### Performance Tests

- Load testing for board data retrieval
- WebSocket connection stress testing
- Database query performance validation

### Backward Compatibility Tests

- Ensure deprecated endpoints still function
- Test migration data format compatibility
- Validate error handling improvements
