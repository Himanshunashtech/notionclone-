import React from "react";
import { Link as RouterLink } from "react-router-dom";

export const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ href, children, ...props }, ref) => {
    return (
      <RouterLink to={href || "/"} ref={ref} {...props}>
        {children}
      </RouterLink>
    );
  }
);
Link.displayName = "Link";

export default Link;
