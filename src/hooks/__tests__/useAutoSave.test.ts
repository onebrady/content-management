import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useAutoSave Hook', () => {
  const mockSaveFunction = jest.fn();
  const mockContent = 'Test Content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the provided content', () => {
    const { result } = renderHook(() =>
      useAutoSave({
        content: mockContent,
        onSave: mockSaveFunction,
        delay: 2000,
      })
    );

    expect(result.current.saveContent).toBeDefined();
    expect(result.current.isDirty).toBeDefined();
  });

  it('should call save function after delay', () => {
    renderHook(() =>
      useAutoSave({
        content: mockContent,
        onSave: mockSaveFunction,
        delay: 2000,
      })
    );

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    // Check if the save function was called
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(mockContent);
  });

  it('should reset timer when content is updated', () => {
    const { result, rerender } = renderHook(
      ({ content }) =>
        useAutoSave({
          content,
          onSave: mockSaveFunction,
          delay: 2000,
        }),
      { initialProps: { content: mockContent } }
    );

    // Advance timer partially
    jest.advanceTimersByTime(1000);

    // Update content
    const updatedContent = 'Updated Content';
    rerender({ content: updatedContent });

    // Clear any previous calls
    mockSaveFunction.mockClear();

    // Advance timer to just before the new timeout
    jest.advanceTimersByTime(1999);

    // Save function should not have been called yet
    expect(mockSaveFunction).not.toHaveBeenCalled();

    // Advance timer to complete the timeout
    jest.advanceTimersByTime(1);

    // Save function should now be called with updated content
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(updatedContent);
  });

  it('should save immediately when saveContent is called', () => {
    const { result } = renderHook(() =>
      useAutoSave({
        content: mockContent,
        onSave: mockSaveFunction,
        delay: 2000,
      })
    );

    act(() => {
      result.current.saveContent();
    });

    // Save function should be called immediately without waiting for timeout
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(mockContent);
  });

  it('should use default delay when not provided', () => {
    renderHook(() =>
      useAutoSave({
        content: mockContent,
        onSave: mockSaveFunction,
      })
    );

    // Default delay is 3000ms
    jest.advanceTimersByTime(2999);
    expect(mockSaveFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
  });

  it('should not save when disabled', () => {
    renderHook(() =>
      useAutoSave({
        content: mockContent,
        onSave: mockSaveFunction,
        delay: 2000,
        enabled: false,
      })
    );

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    // Save function should not be called when disabled
    expect(mockSaveFunction).not.toHaveBeenCalled();
  });

  it('should not save when content is empty', () => {
    renderHook(() =>
      useAutoSave({
        content: '',
        onSave: mockSaveFunction,
        delay: 2000,
      })
    );

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    // Save function should not be called when content is empty
    expect(mockSaveFunction).not.toHaveBeenCalled();
  });
});
