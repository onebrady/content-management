# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-08-projects-persistence-fix/spec.md

## Technical Requirements

- UI (Mantine)
  - Keep existing columns/cards layout; no new components required.
  - Maintain drag visual guards: disable transitions during drag/drop (styles.dragging, styles.dropAnimating).
  - Ensure only the card list Stack is droppable so headers aren’t covered when dropping at index 0.

- State/Data (React Query)
  - Queries: projectKeys.list('all') for /projects board.
  - Mutations: use mutateAsync for drop persistence; retain optimistic reordering.
  - Invalidate on success: invalidateQueries(projectKeys.list('all')) and refetch immediately.
  - Debug phase: temporarily set staleTime to 0 for useProjects, restore to 30_000 after validation.

- API (Next.js App Router)
  - PATCH /api/projects/[id]
    - Accept: { destStatus: string; destIndex: number } (destination intent)
    - Compute statusOrder server-side using neighbors within destStatus:
      - prev = item at destIndex - 1, next = item at destIndex (ordered by statusOrder asc)
      - If both present and gap > 1: prev + floor((next - prev)/2)
      - If only prev: prev + 1000
      - If only next: next - 1000
      - If list empty: 0
    - Update project with { status: destStatus, statusOrder }.
    - Backward compatibility:
      - If legacy { status, statusOrder } provided and destIndex absent, keep current behavior (append if statusOrder missing).
    - Response: standardized success shape with updated { id, status, statusOrder, updatedAt }.

- Database (Prisma + Neon)
  - No schema changes. Ensure index @@index([status, statusOrder]) present (already exists).
  - Queries must select minimal fields for compute (id, statusOrder, ownerId if needed).

- Error Handling
  - API: return { error: string } with appropriate status codes (400/404/500).
  - Client: on mutation error, rollback optimistic state via context snapshot; show Mantine notification.

- Performance & SEO
  - Ordering compute uses indexed query on status; acceptable for typical column sizes.
  - Keep payloads minimal; avoid n+1 queries.

- Security & Permissions
  - No changes; PATCH remains accessible to authenticated users per existing policy.

## Implementation Notes

- Client payload change: from computed statusOrder to { destStatus, destIndex }.
- Maintain normalization to kebab-case IDs (e.g., "In Progress" → in-progress).
- Dev-only logs for dragEnd inputs and server compute outputs; remove after validation.

## Test Strategy (high-level)

- Unit: server order computation across empty/start/middle/end/dense cases.
- Integration (RTL): simulate DnD drop, assert payload, optimistic reorder, and final refetch state.
- E2E (Playwright): cross-column and in-column moves persist across reload.
