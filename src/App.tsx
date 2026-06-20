import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routing";
import { AuthProvider, useAuth } from "./lib/auth";

function AppInner() {
  const { session } = useAuth();

  useEffect(() => {
    router.update({ context: { session } });
  }, [session]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
