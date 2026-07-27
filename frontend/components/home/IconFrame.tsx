import React from "react";

export function IconFrame({
  icon: Icon,
  ...props
}: { icon: React.ElementType } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>{Icon && <Icon className="h-6 w-6" aria-hidden="true" />}</div>
  );
}