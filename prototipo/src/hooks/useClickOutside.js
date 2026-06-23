import { useEffect } from 'react';

export function useClickOutside(ref, activo, onOutside) {
  useEffect(() => {
    if (!activo) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activo, onOutside, ref]);
}
