# Spec Tasks

## Tasks

- [ ] 1. **Component Integration and Route Updates**
  - [ ] 1.1 Write tests for new board component integration in existing routes
  - [ ] 1.2 Replace ProjectBoard component with BoardView in /projects/[id]/page.tsx
  - [ ] 1.3 Update projects listing page to work with new schema (lists/cards counts)
  - [ ] 1.4 Integrate UserPresence and ConflictResolutionModal components
  - [ ] 1.5 Update navigation links to ensure proper routing to new board interface
  - [ ] 1.6 Add real-time collaboration features to project board pages
  - [ ] 1.7 Verify all component integration tests pass and new interface loads correctly

- [ ] 2. **API Integration and Endpoint Updates**
  - [ ] 2.1 Write tests for board API endpoint integration
  - [ ] 2.2 Update GET /api/projects to return lists/cards counts instead of columns/tasks
  - [ ] 2.3 Ensure GET /api/projects/[id]/board endpoint is properly integrated
  - [ ] 2.4 Update project hooks to use new board API endpoints
  - [ ] 2.5 Remove or redirect old column/task API endpoints
  - [ ] 2.6 Test all API endpoints work with new board interface
  - [ ] 2.7 Verify API integration tests pass and response formats are correct

- [ ] 3. **Old Code Removal and Cleanup**
  - [ ] 3.1 Write tests to ensure old components are properly removed
  - [ ] 3.2 Remove old ProjectBoard component and related files
  - [ ] 3.3 Remove TaskCard, TaskCreateModal, and task management components
  - [ ] 3.4 Remove old column/task API routes and controllers
  - [ ] 3.5 Remove old project data hooks that use column/task schema
  - [ ] 3.6 Clean up unused TypeScript types and interfaces
  - [ ] 3.7 Verify codebase is clean and no old project management code remains

- [ ] 4. **Real-time Collaboration Activation**
  - [ ] 4.1 Write tests for real-time features in project boards
  - [ ] 4.2 Ensure Socket.IO server is active for all project board pages
  - [ ] 4.3 Activate user presence indicators showing online collaborators
  - [ ] 4.4 Enable real-time card movement and list updates across users
  - [ ] 4.5 Activate conflict resolution for simultaneous edits
  - [ ] 4.6 Test WebSocket connections work properly across browser instances
  - [ ] 4.7 Verify all real-time collaboration features function correctly

- [ ] 5. **Final Testing and Validation**
  - [ ] 5.1 Write comprehensive end-to-end tests for new project management system
  - [ ] 5.2 Test complete user workflow: create project → add lists → add cards → collaborate
  - [ ] 5.3 Verify all navigation links work and route to correct new interfaces
  - [ ] 5.4 Test real-time collaboration with multiple users simultaneously
  - [ ] 5.5 Ensure mobile and responsive design works properly
  - [ ] 5.6 Validate no broken links or references to old system remain
  - [ ] 5.7 Confirm new Trello-like project management system is fully functional
