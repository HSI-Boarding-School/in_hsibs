import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routing";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./components/ui/ToastProvider";

function AppInner() {
  const { session } = useAuth();

  useEffect(() => {
    router.update({ context: { session } });
  }, [session]);

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
