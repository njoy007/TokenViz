import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Initial setup
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

  const toggle = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors z-50 shadow-sm"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ type: 'spring', bounce: 0.4 }}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
    </button>
  );
}
