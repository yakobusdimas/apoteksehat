import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.1rem] w-[1.1rem] transition-all" />
      ) : (
        <Sun className="h-[1.1rem] w-[1.1rem] transition-all" />
      )}
    </Button>
  );
}
