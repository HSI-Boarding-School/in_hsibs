import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routing";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./components/ui/ToastProvider";

function AppInner() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 px-5 py-4 text-muted shadow-[0_18px_54px_rgba(0,0,0,0.08)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          <span className="text-xs font-extrabold">Memulihkan sesi...</span>
        </div>
      </div>
    );
  }

  router.update({ context: { session } });
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
