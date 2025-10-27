import { useCallback, useState } from "react";

interface UseFormModalReturn<T> {
  isOpen: boolean;
  open: (item?: T) => void;
  close: () => void;
  selectedItem: T | null;
  setSelectedItem: (item: T | null) => void;
}

/**
 * Custom hook for managing form modal with selected item state
 * @returns Object with modal state, selected item, and control functions
 */
export function useFormModal<T = any>(): UseFormModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    if (item) {
      setSelectedItem(item);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear selected item after modal close animation
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  return {
    isOpen,
    open,
    close,
    selectedItem,
    setSelectedItem,
  };
}
