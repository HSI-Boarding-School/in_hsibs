import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routing";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";

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
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
