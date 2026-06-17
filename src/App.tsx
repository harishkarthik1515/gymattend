import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Routes } from '@/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gym-theme">
      <div className="min-h-screen bg-background">
        <Routes />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;