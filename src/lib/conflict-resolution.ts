import { notifications } from '@mantine/notifications';

export interface ConflictData {
  type: 'card' | 'list' | 'checklist';
  id: string;
  localChanges: any;
  remoteChanges: any;
  timestamp: string;
  conflictedBy: {
    userId: string;
    userName: string;
  };
}

export interface ConflictResolution {
  action: 'merge' | 'override' | 'cancel';
  resolvedData?: any;
}

export class ConflictResolver {
  private static conflicts = new Map<string, ConflictData>();
  private static conflictListeners = new Map<string, ((conflict: ConflictData) => void)[]>();

  /**
   * Register a conflict for resolution
   */
  static registerConflict(conflict: ConflictData): void {
    const conflictKey = `${conflict.type}:${conflict.id}`;
    this.conflicts.set(conflictKey, conflict);

    // Notify listeners
    const listeners = this.conflictListeners.get(conflictKey) || [];
    listeners.forEach(listener => listener(conflict));

    // Show notification
    notifications.show({
      id: `conflict-${conflictKey}`,
      title: 'Conflict detected',
      message: `${conflict.conflictedBy.userName} made changes to the same ${conflict.type}. Please resolve the conflict.`,
      color: 'orange',
      autoClose: false,
    });
  }

  /**
   * Resolve a conflict
   */
  static resolveConflict(
    type: string,
    id: string,
    resolution: ConflictResolution
  ): any {
    const conflictKey = `${type}:${id}`;
    const conflict = this.conflicts.get(conflictKey);

    if (!conflict) {
      console.warn(`No conflict found for ${conflictKey}`);
      return null;
    }

    let resolvedData: any = null;

    switch (resolution.action) {
      case 'merge':
        resolvedData = this.mergeChanges(conflict.localChanges, conflict.remoteChanges);
        break;
      case 'override':
        resolvedData = conflict.localChanges;
        break;
      case 'cancel':
        resolvedData = conflict.remoteChanges;
        break;
    }

    // Clean up conflict
    this.conflicts.delete(conflictKey);
    notifications.hide(`conflict-${conflictKey}`);

    notifications.show({
      title: 'Conflict resolved',
      message: `Changes have been ${resolution.action === 'merge' ? 'merged' : resolution.action === 'override' ? 'applied' : 'discarded'}.`,
      color: 'green',
    });

    return resolvedData;
  }

  /**
   * Check if there's an active conflict for a resource
   */
  static hasConflict(type: string, id: string): boolean {
    return this.conflicts.has(`${type}:${id}`);
  }

  /**
   * Get active conflict for a resource
   */
  static getConflict(type: string, id: string): ConflictData | null {
    return this.conflicts.get(`${type}:${id}`) || null;
  }

  /**
   * Listen for conflicts on a specific resource
   */
  static onConflict(
    type: string,
    id: string,
    listener: (conflict: ConflictData) => void
  ): () => void {
    const conflictKey = `${type}:${id}`;
    
    if (!this.conflictListeners.has(conflictKey)) {
      this.conflictListeners.set(conflictKey, []);
    }
    
    this.conflictListeners.get(conflictKey)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.conflictListeners.get(conflictKey) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        this.conflictListeners.delete(conflictKey);
      }
    };
  }

  /**
   * Smart merge of changes based on field types
   */
  private static mergeChanges(localChanges: any, remoteChanges: any): any {
    const merged = { ...localChanges };

    for (const [key, remoteValue] of Object.entries(remoteChanges)) {
      const localValue = localChanges[key];

      // If local doesn't have this field, use remote
      if (localValue === undefined) {
        merged[key] = remoteValue;
        continue;
      }

      // Handle different field types
      switch (typeof remoteValue) {
        case 'string':
          // For strings, prefer the longer/more recent version
          if (typeof localValue === 'string') {
            merged[key] = localValue.length >= (remoteValue as string).length 
              ? localValue 
              : remoteValue;
          } else {
            merged[key] = remoteValue;
          }
          break;

        case 'number':
          // For numbers (like positions), use the more recent one
          merged[key] = remoteValue;
          break;

        case 'boolean':
          // For booleans, prefer local changes (user intent)
          merged[key] = localValue;
          break;

        case 'object':
          if (Array.isArray(remoteValue) && Array.isArray(localValue)) {
            // For arrays, merge unique items
            merged[key] = this.mergeArrays(localValue, remoteValue);
          } else if (remoteValue && localValue && typeof localValue === 'object') {
            // For objects, recursively merge
            merged[key] = this.mergeChanges(localValue, remoteValue);
          } else {
            merged[key] = remoteValue;
          }
          break;

        default:
          merged[key] = remoteValue;
      }
    }

    return merged;
  }

  /**
   * Merge arrays by combining unique items
   */
  private static mergeArrays(localArray: any[], remoteArray: any[]): any[] {
    const merged = [...localArray];
    
    for (const remoteItem of remoteArray) {
      // Check if item exists (basic equality check)
      const exists = merged.some(localItem => {
        if (typeof localItem === 'object' && localItem.id) {
          return localItem.id === remoteItem.id;
        }
        return localItem === remoteItem;
      });

      if (!exists) {
        merged.push(remoteItem);
      }
    }

    return merged;
  }

  /**
   * Detect if changes conflict
   */
  static detectConflict(
    localChanges: any,
    remoteChanges: any,
    lastKnownState?: any
  ): boolean {
    // If no lastKnownState, assume conflict if both have changes
    if (!lastKnownState) {
      return Object.keys(localChanges).some(key => 
        remoteChanges.hasOwnProperty(key)
      );
    }

    // Check if both local and remote modified the same fields differently
    for (const key of Object.keys(localChanges)) {
      if (remoteChanges.hasOwnProperty(key)) {
        const localValue = localChanges[key];
        const remoteValue = remoteChanges[key];
        const originalValue = lastKnownState[key];

        // If both changed from original but to different values, it's a conflict
        if (
          localValue !== originalValue &&
          remoteValue !== originalValue &&
          localValue !== remoteValue
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all active conflicts
   */
  static getAllConflicts(): ConflictData[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Clear all conflicts (useful for cleanup)
   */
  static clearAllConflicts(): void {
    this.conflicts.clear();
    this.conflictListeners.clear();
  }
}

/**
 * Hook for managing conflicts in components
 */
export function useConflictResolution(type: string, id: string) {
  const hasConflict = ConflictResolver.hasConflict(type, id);
  const conflict = ConflictResolver.getConflict(type, id);

  const resolveConflict = (resolution: ConflictResolution) => {
    return ConflictResolver.resolveConflict(type, id, resolution);
  };

  const onConflict = (listener: (conflict: ConflictData) => void) => {
    return ConflictResolver.onConflict(type, id, listener);
  };

  return {
    hasConflict,
    conflict,
    resolveConflict,
    onConflict,
  };
}
