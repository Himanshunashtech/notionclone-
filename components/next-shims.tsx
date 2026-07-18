import React from "react";
import { Link as RouterLink, useNavigate, useParams as useRouterParams, useLocation } from "react-router-dom";

// next/link shim
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

// next/navigation shim
export const useRouter = () => {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  };
};

export const useParams = () => {
  return useRouterParams();
};

export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};

// next/image shim
export const Image = ({ src, alt, width, height, className, priority, ...props }: any) => {
  return (
    <img
      src={src}
      alt={alt || ""}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default Link;
