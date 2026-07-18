import React, { ComponentType } from "react";

export const dynamic = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  options?: any
) => {
  const LazyComponent = React.lazy(importFunc);
  
  const ShimmedComponent = (props: any) => {
    return (
      <React.Suspense fallback={options?.loading ? <options.loading /> : null}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
  ShimmedComponent.displayName = "DynamicComponent";
  return ShimmedComponent;
};

export default dynamic;
