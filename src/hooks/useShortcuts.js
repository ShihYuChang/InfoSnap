import { useEffect } from 'react';

export function useShortcuts(keydownHandlers, keyupHandlers, dependencies) {
  useEffect(() => {
    function handleKeydown(e) {
      const handler = keydownHandlers[e.key];
      if (handler) {
        handler(e);
      }
    }

    function handleKeyUp(e) {
      if (keyupHandlers) {
        e.preventDefault();
        const handler = keyupHandlers[e.key];
        if (handler) {
          handler(e);
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);
    keyupHandlers && window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      keyupHandlers && window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keydownHandlers, keyupHandlers]);

  return;
}
