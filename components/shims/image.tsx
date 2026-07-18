import React from "react";

export const Image = ({ src, alt, width, height, fill, className, priority, ...props }: any) => {
  const fillStyles: React.CSSProperties = fill
    ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: "cover",
      }
    : {};

  return (
    <img
      src={src}
      alt={alt || ""}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={{ ...fillStyles, ...props.style }}
      {...props}
    />
  );
};

export default Image;
