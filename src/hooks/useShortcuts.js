import { useEffect } from 'react';

export function useShortcuts(
  keydownHandlers,
  keyupHandlers,
  dependencies,
  defaultHandler
) {
  useEffect(() => {
    function handleKeydown(e) {
      const shortcutValues = Object.keys(keydownHandlers).reduce((obj, key) => {
        obj[key] = keydownHandlers[key];
        return obj;
      }, {});
      const handler = shortcutValues[e.key] || defaultHandler;
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
  }, dependencies);

  return;
}
