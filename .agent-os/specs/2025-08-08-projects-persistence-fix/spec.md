# Spec Requirements Document

> Spec: /projects Card Movement Persistence Fix
> Created: 2025-08-08
> Status: Planning

## Overview

Ensure that card moves on `/projects` (Trello-style board) persist immediately (status and position) and survive page reloads without additional user interaction. Remove lingering drop-shadow artifacts after drop.

## User Stories

### Move cards across columns (status)

As a content manager, I want to drag a project card from “Planning” to “In Progress” so that its new status is saved and remains after refreshing the page.

- Workflow: user drags card to a new column, drops, sees success, reloads, card remains in target column at correct position.

### Reorder cards within a column

As a content manager, I want to reorder project cards within a column so that their relative order is preserved after page reloads.

- Workflow: user drags card within same column, drops, sees updated order, reloads, order persists.

## Spec Scope

1. Persistence: Moves (cross-column and in-column) must persist status and order.
2. Visual correctness: Drop shadow clears on drop; no header overlap when dropped at index 0.
3. Robustness: No need for second interaction to “finalize.”
4. Backward compatibility: Legacy clients sending `status/statusOrder` continue to work.
5. Tests: Unit, integration, and E2E to validate persistence and ordering.

## Out of Scope

- Email notifications or real-time multi-user sync changes (beyond existing behavior).
- New database fields; we keep `Project.statusOrder`.
- Board for `/projects/[id]` (BoardView) beyond ensuring it’s unaffected.

## Expected Deliverable

1. After moving a card and reloading, the card remains in the new column with correct order.
2. No lingering drop shadow or header overlap after drop.
3. Green build (`pnpm run build`), unit/integration tests passing, E2E validates persistence.
