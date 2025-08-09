# Spec Tasks

## Tasks

- [x] 1. Server: Authoritative order compute in PATCH /api/projects/[id]
  - [x] 1.1 Unit tests for order compute (empty/start/middle/end/dense)
  - [x] 1.2 Implement { destStatus, destIndex } handling and compute statusOrder
  - [x] 1.3 Return updated { status, statusOrder } in standardized response
  - [x] 1.4 Verify tests pass

- [x] 2. Client: Update dragEnd payload and optimistic handling
  - [x] 2.1 Send { destStatus, destIndex } from dragEnd
  - [x] 2.2 Keep optimistic reorder; explicit refetch on success
  - [x] 2.3 Temporary staleTime: 0 for debugging; restore post-validation
  - [x] 2.4 Verify tests pass

- [x] 3. Integration tests (/projects)
  - [x] 3.1 Update mocks to validate new payload
  - [x] 3.2 Assert persistence across refetch
  - [x] 3.3 Verify tests pass

- [x] 4. E2E tests (Playwright)
  - [x] 4.1 Move across columns; reload persists (spec added)
  - [x] 4.2 Reorder within column; reload persists (spec added)
  - [x] 4.3 Error rollback + notification (spec added)
  - [ ] 4.4 Verify tests pass (pending auth bypass CI config)

- [ ] 5. Cleanup & Docs
  - [ ] 5.1 Remove dev logs
  - [x] 5.2 Restore staleTime to 30_000
  - [ ] 5.3 Document payload and ordering strategy
