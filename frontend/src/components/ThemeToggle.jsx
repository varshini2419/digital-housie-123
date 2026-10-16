import { useEffect } from 'react';

const ThemeToggle = () => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      try {
        localStorage.setItem('theme', 'light');
      } catch (_) {}
    }
  }, []);

  return null;
};

export default ThemeToggle;

