import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useAutoSave Hook', () => {
  const mockSaveFunction = jest.fn();
  const mockData = { title: 'Test Title', content: 'Test Content' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the provided data', () => {
    const { result } = renderHook(() =>
      useAutoSave(mockData, mockSaveFunction, 2000)
    );

    expect(result.current.data).toEqual(mockData);
  });

  it('should update data when updateData is called', () => {
    const { result } = renderHook(() =>
      useAutoSave(mockData, mockSaveFunction, 2000)
    );

    const updatedData = { ...mockData, title: 'Updated Title' };

    act(() => {
      result.current.updateData(updatedData);
    });

    expect(result.current.data).toEqual(updatedData);
  });

  it('should call save function after delay', () => {
    renderHook(() => useAutoSave(mockData, mockSaveFunction, 2000));

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    // Check if the save function was called
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(mockData);
  });

  it('should reset timer when data is updated', () => {
    const { result } = renderHook(() =>
      useAutoSave(mockData, mockSaveFunction, 2000)
    );

    // Advance timer partially
    jest.advanceTimersByTime(1000);

    // Update data
    const updatedData = { ...mockData, title: 'Updated Title' };
    act(() => {
      result.current.updateData(updatedData);
    });

    // Advance timer to just before the new timeout
    jest.advanceTimersByTime(1999);

    // Save function should not have been called yet
    expect(mockSaveFunction).not.toHaveBeenCalled();

    // Advance timer to complete the timeout
    jest.advanceTimersByTime(1);

    // Save function should now be called with updated data
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(updatedData);
  });

  it('should save immediately when saveNow is called', () => {
    const { result } = renderHook(() =>
      useAutoSave(mockData, mockSaveFunction, 2000)
    );

    act(() => {
      result.current.saveNow();
    });

    // Save function should be called immediately without waiting for timeout
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith(mockData);
  });

  it('should use default delay when not provided', () => {
    renderHook(() => useAutoSave(mockData, mockSaveFunction));

    // Default delay is 3000ms
    jest.advanceTimersByTime(2999);
    expect(mockSaveFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
  });
});
