# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-01-07-kanban-drag-drop-fix/spec.md

## Technical Requirements

### Core Drag Implementation

- Replace Mantine Paper components with native HTML `div` elements for draggable cards to avoid CSS positioning conflicts
- Apply `{...provided.draggableProps}` and `{...provided.dragHandleProps}` directly to the card container element
- Ensure `provided.draggableProps.style` is properly spread and not overridden by component styles
- Implement proper `ref={provided.innerRef}` on the draggable element

### Visual Feedback System

- Create CSS classes for drag states: `.dragging`, `.dragHandle`, `.droppableColumn`
- Implement hover states with `transform: translateY(-1px)` for non-dragging cards
- Add visual feedback during drag: rotation, scale, opacity, and shadow changes
- Highlight drop zones with background color changes and border styling when cards are dragged over them
- Use CSS transitions for smooth state changes except during active drag operations

### State Management

- Remove optimistic updates during drag operations to prevent UI interference
- Use simple API calls in `onDragEnd` handler that only fire after drag completion
- Implement `queryClient.invalidateQueries` only after successful API response
- Avoid any state changes that trigger re-renders during active drag operations

### Event Handler Implementation

- Simplify `handleDragEnd` to only handle essential drop logic without complex error handling
- Remove `onDragStart` handler to eliminate potential state conflicts
- Focus `handleDragEnd` on status changes between columns only, ignoring same-column moves
- Ensure drop detection works reliably with proper `destination` validation

### CSS Integration

- Use CSS modules for drag-specific styling to avoid global style conflicts
- Implement proper cursor states: `cursor: grab` for rest state, `cursor: grabbing` for drag state
- Add `user-select: none` and touch-action properties for better drag experience
- Use `pointer-events: none` on dragging elements to prevent hover state conflicts

### Cross-browser Compatibility

- Test drag functionality in Chrome, Firefox, Safari, and Edge
- Ensure touch events don't interfere with mouse drag operations
- Validate drag positioning calculations work correctly across different screen sizes
- Test with different zoom levels and display scaling

## Performance Considerations

- Minimize re-renders during drag operations by avoiding unnecessary state updates
- Use `useCallback` for drag handlers to prevent unnecessary re-creation
- Implement proper cleanup of event listeners and timers
- Ensure drag operations don't trigger expensive database queries until completion

## Error Handling

- Implement fallback behavior when drag operations fail (card returns to original position)
- Add proper error boundaries around drag components
- Log drag operation failures for debugging purposes
- Provide user feedback when status updates fail after successful drag completion
