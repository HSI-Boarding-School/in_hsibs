import { useEffect } from "react";
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
import { SiswaLoginPage } from "./features/auth/SiswaLoginPage";
import { DashboardShell } from "./components/layout/DashboardShell";
import {
  AdminDashboardHome,
  AdminDashboardMapping,
  AdminDashboardMonitoring,
  AdminDashboardReport,
  AdminDashboardSettings,
  RoleDashboardContent,
  SiswaDashboard,
} from "./features/dashboard";
import {
  PicDivHome,
  PicDivSantri,
  PicDivReport,
  PicDivSettings,
  PicDivValidation,
} from "./features/dashboard/pic-div";
import {
  PicRegHome,
  PicRegSantri,
  PicRegMonitoring,
  PicRegReport,
  PicRegSettings,
} from "./features/dashboard/pic-reg";
import { roles } from "./data/monitoringData";
import type { RoleId, Session } from "./types";

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

const loginRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/$role",
  beforeLoad: ({ params }) => {
    if (params.role === "siswa") {
      throw redirect({ to: "/portal-siswa" });
    }
    if (!validRoleIds.includes(params.role as RoleId)) {
      throw redirect({ to: "/login" });
    }
  },
  component: LoginRoleRouteComponent,
});

const portalSiswaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal-siswa",
  component: PortalSiswaRouteComponent,
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
  loginRoleRoute,
  portalSiswaRoute,
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

const PicDivTabComponents: Record<string, React.FC> = {
  home: PicDivHome,
  mapping: PicDivSantri,
  monitoring: PicDivValidation,
  report: PicDivReport,
  settings: PicDivSettings,
};

const PicRegTabComponents: Record<string, React.FC> = {
  home: PicRegHome,
  mapping: PicRegSantri,
  monitoring: PicRegMonitoring,
  report: PicRegReport,
  settings: PicRegSettings,
};

const validTabs = Object.keys(adminTabComponents);
const validRoleIds = roles.map((item) => item.id) as RoleId[];

function LoginRouteComponent() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(credentials: Session) {
    login(credentials);
    router.update({ context: { session: credentials } });
    navigate({ to: "/dashboard/$tab", params: { tab: "home" } });
  }

  const staffRoles = roles.filter((r) => r.id !== "siswa");

  return (
    <LoginPage
      roles={staffRoles}
      onLogin={handleLogin}
      onSelectRole={(role) =>
        navigate({ to: "/login/$role", params: { role } })
      }
      onNavigateToSiswaPortal={() => navigate({ to: "/portal-siswa" })}
    />
  );
}

function LoginRoleRouteComponent() {
  const { role } = loginRoleRoute.useParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(credentials: Session) {
    login(credentials);
    router.update({ context: { session: credentials } });
    navigate({ to: "/dashboard/$tab", params: { tab: "home" } });
  }

  return (
    <LoginPage
      key={role}
      roles={roles}
      initialRole={role as RoleId}
      onLogin={handleLogin}
      onBackToChooser={() => navigate({ to: "/login" })}
    />
  );
}

function PortalSiswaRouteComponent() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(credentials: Session) {
    login(credentials);
    router.update({ context: { session: credentials } });
    navigate({ to: "/dashboard/$tab", params: { tab: "home" } });
  }

  return (
    <SiswaLoginPage
      onLogin={handleLogin}
      onBackToMainPortal={() => navigate({ to: "/login" })}
    />
  );
}

function DashboardLayout() {
  const { session, logout } = useAuth();

  useEffect(() => {
    if (!session) {
      router.navigate({ to: "/login" });
    }
  }, [session]);

  if (!session) return null;

  return (
    <DashboardShell onLogout={logout} user={session}>
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

  if (session.role === "pic-div") {
    return <PicDivPage activePage={activePage} />;
  }

  if (session.role === "pic-reg") {
    return <PicRegPage activePage={activePage} />;
  }

  if (session.role === "siswa") {
    return <SiswaDashboard user={session} activePage={activePage} />;
  }

  return <RoleDashboardContent user={session} activePage={activePage} />;
}

function AdminPage({ activePage }: { activePage: string }) {
  const PageComponent = adminTabComponents[activePage];

  return PageComponent ? <PageComponent /> : null;
}

function PicDivPage({ activePage }: { activePage: string }) {
  const PageComponent = PicDivTabComponents[activePage];

  return PageComponent ? <PageComponent /> : null;
}

function PicRegPage({ activePage }: { activePage: string }) {
  const PageComponent = PicRegTabComponents[activePage];

  return PageComponent ? <PageComponent /> : null;
}
