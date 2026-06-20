import { forwardRef } from "react";
import SimpleBar from "simplebar-react";
import { cn } from "../../lib/utils";
import { scrollbarClasses } from "./classes";
import "./styles.css";

import type { ReactNode, CSSProperties } from "react";

interface ScrollbarSlotProps {
  wrapperSx?: CSSProperties;
  contentWrapperSx?: CSSProperties;
  contentSx?: CSSProperties;
}

interface ScrollbarProps {
  children: ReactNode;
  className?: string;
  sx?: CSSProperties | CSSProperties[];
  slotProps?: ScrollbarSlotProps;
  fillContent?: boolean;
}

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
  function Scrollbar(
    { children, className, slotProps, fillContent = true, sx, ...other },
    ref,
  ) {
    const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];

    const rootStyle: CSSProperties = {
      minWidth: 0,
      minHeight: 0,
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      ...sxList.reduce<CSSProperties>((acc, s) => ({ ...acc, ...s }), {}),
    };

    return (
      <SimpleBar
        scrollableNodeProps={{ ref }}
        clickOnTrack={false}
        className={cn(scrollbarClasses.root, !fillContent && "scrollbar__no-fill", className)}
        style={rootStyle}
        {...other}
      >
        {children}
      </SimpleBar>
    );
  },
);
