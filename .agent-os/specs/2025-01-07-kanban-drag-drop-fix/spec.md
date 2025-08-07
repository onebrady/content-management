# Spec Requirements Document

> Spec: Kanban Drag Drop Fix
> Created: 2025-01-07
> Status: Planning

## Overview

Fix the broken drag-and-drop functionality in the project Kanban board where cards disappear, bounce to wrong positions, or appear on the right side of the screen instead of smoothly following the cursor. This critical UX issue prevents users from effectively managing project status transitions and undermines the core Kanban workflow functionality.

## User Stories

### Smooth Card Movement

As a project manager, I want to drag project cards between status columns seamlessly, so that I can quickly update project status without frustration or confusion.

**Detailed Workflow:** User clicks and holds a project card, the card follows their cursor smoothly with visual feedback, they drag it over a target column which highlights to show drop zone, and they release to complete the status change with immediate visual confirmation.

### Visual Feedback During Drag

As a user, I want clear visual feedback when dragging cards, so that I know the system is responding correctly and understand where I can drop the card.

**Detailed Workflow:** When dragging begins, the card becomes semi-transparent with a slight rotation, target columns highlight when hovered over, and the original position shows a placeholder indicating where the card will return if dropped outside a valid zone.

### Reliable Drop Detection

As a user, I want cards to consistently drop in the intended column, so that my project status updates are accurate and I don't have to retry the action multiple times.

**Detailed Workflow:** When a card is dragged over a valid drop zone, the zone provides clear visual indication, dropping the card immediately updates the database and UI, and the card animates smoothly to its final position in the new column.

## Spec Scope

1. **Card Positioning Fix** - Replace problematic Mantine Paper components with native HTML elements that properly support drag positioning
2. **Drag Library Integration** - Correctly implement @hello-pangea/dnd props and event handlers to ensure smooth drag behavior
3. **Visual Feedback System** - Add proper CSS animations and states for dragging, hovering, and dropping
4. **State Management** - Implement clean optimistic updates that don't interfere with drag operations
5. **Cross-browser Compatibility** - Ensure drag functionality works consistently across modern browsers

## Out of Scope

- Drag and drop within the same column (reordering)
- Multi-card selection and drag
- Keyboard accessibility for drag operations
- Touch/mobile drag support optimization
- Drag to archive or delete functionality

## Expected Deliverable

1. **Smooth Drag Experience** - Cards follow cursor without disappearing, jumping, or appearing in wrong positions during drag operations
2. **Visual Feedback** - Clear indication of drag state, valid drop zones, and smooth animations during transitions
3. **Reliable Status Updates** - Card drops correctly update project status in database and UI reflects changes immediately
