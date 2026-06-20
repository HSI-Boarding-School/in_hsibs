import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useAuth } from "./lib/auth";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardShell } from "./components/layout/DashboardShell";
import {
  AdminDashboardHome,
  AdminDashboardMapping,
  AdminDashboardMonitoring,
  AdminDashboardReport,
  AdminDashboardSettings,
  RoleDashboardContent,
} from "./features/dashboard";
import { roles } from "./data/monitoringData";
import type { Session } from "./types";

interface RouterContext {
  session: Session | null;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/$tab", params: { tab: "home" } });
  },
  component: () => null,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginRouteComponent,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
  },
  component: DashboardLayout,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/$tab", params: { tab: "home" } });
  },
  component: () => null,
});

const dashboardTabRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "$tab",
  component: DashboardTab,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute.addChildren([dashboardIndexRoute, dashboardTabRoute]),
]);

export const router = createRouter({
  routeTree,
  context: { session: null },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const adminTabComponents: Record<string, React.FC> = {
  home: AdminDashboardHome,
  mapping: AdminDashboardMapping,
  monitoring: AdminDashboardMonitoring,
  report: AdminDashboardReport,
  settings: AdminDashboardSettings,
};

const validTabs = Object.keys(adminTabComponents);

function LoginRouteComponent() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(credentials: Session) {
    login(credentials);
    router.update({ context: { session: credentials } });
    navigate({ to: "/dashboard/$tab", params: { tab: "home" } });
  }

  return <LoginPage roles={roles} onLogin={handleLogin} />;
}

function DashboardLayout() {
  const { session, logout } = useAuth();

  return (
    <DashboardShell onLogout={logout} user={session!}>
      <Outlet />
    </DashboardShell>
  );
}

function DashboardTab() {
  const { tab } = dashboardTabRoute.useParams();
  const { session } = useAuth();

  if (!session) return null;

  const activePage = validTabs.includes(tab) ? tab : "home";

  if (session.role === "admin") {
    return <AdminPage activePage={activePage} />;
  }

  return <RoleDashboardContent user={session} activePage={activePage} />;
}

function AdminPage({ activePage }: { activePage: string }) {
  const PageComponent = adminTabComponents[activePage];

  return PageComponent ? <PageComponent /> : null;
}
