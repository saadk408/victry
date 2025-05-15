// File: /app/_lib/hooks/use-undo-history.ts
import { useState, useCallback } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Custom hook for managing state with undo/redo capability
 * Tracks history of state changes and provides functions to navigate through them
 *
 * @param initialPresent - Initial state value
 * @returns Object with current state, undo/redo functions, and history information
 */
export function useUndoHistory<T>(initialPresent: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  // Update current state and move previous state to history
  const setState = useCallback((newPresent: T, trackHistory = true) => {
    setHistory((prev) => {
      // If not tracking history, just update present without affecting past/future
      if (!trackHistory) {
        return {
          ...prev,
          present: newPresent,
        };
      }

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: [],
      };
    });
  }, []);

  // Go back to previous state
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Go forward to next state (if previously undone)
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Reset history
  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  // Return current state and functions
  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
