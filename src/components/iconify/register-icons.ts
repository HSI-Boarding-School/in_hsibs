import { addCollection } from "@iconify/react";
import allIcons from "./icon-sets";

// ----------------------------------------------------------------------

interface IconEntry {
  body: string;
}

interface IconSet {
  prefix: string;
  icons: Record<string, IconEntry>;
  width: number;
  height: number;
}

export const iconSets: IconSet[] = Object.entries(
  allIcons as Record<string, IconEntry>,
).reduce<IconSet[]>((acc, [key, value]) => {
  const [prefix, iconName] = key.split(":");
  const existingPrefix = acc.find((item) => item.prefix === prefix);

  if (existingPrefix) {
    existingPrefix.icons[iconName] = value;
  } else {
    acc.push({
      prefix,
      icons: { [iconName]: value },
      width: prefix === "carbon" ? 32 : 24,
      height: prefix === "carbon" ? 32 : 24,
    });
  }

  return acc;
}, []);

export const allIconNames: string[] = Object.keys(
  allIcons as Record<string, IconEntry>,
);

// ----------------------------------------------------------------------

let areIconsRegistered = false;

export function registerIcons() {
  if (areIconsRegistered) return;

  iconSets.forEach((iconSet) => {
    addCollection(iconSet);
  });

  areIconsRegistered = true;
}
