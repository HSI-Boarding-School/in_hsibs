declare module "simplebar-react" {
  import type { ComponentType, ReactNode, HTMLAttributes, RefObject } from "react";

  import type { RefCallback } from "react";

  interface SimpleBarProps extends HTMLAttributes<HTMLDivElement> {
    scrollableNodeProps?: {
      ref?: RefObject<HTMLDivElement | null> | RefCallback<HTMLDivElement> | null;
    };
    clickOnTrack?: boolean;
    children?: ReactNode;
  }

  const SimpleBar: ComponentType<SimpleBarProps>;
  export default SimpleBar;
}
