import { BottomDock } from "./BottomDock";
import { navigationItems } from "../../data/monitoringData";

/**
 * Backward-compatible alias for the current bottom navigation.
 * The active implementation lives in BottomDock.tsx.
 */
export function NavbarBottom() {
  return <BottomDock items={navigationItems} />;
}
