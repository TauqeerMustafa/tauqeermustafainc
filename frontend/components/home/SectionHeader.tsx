import React from "react";

type SectionHeaderProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function SectionHeader({
  eyebrow,
  title,
  description,
  ...props
}: SectionHeaderProps) {
  return (
    <div {...props}>
      {eyebrow && <p>{eyebrow}</p>}
      {title && <h2 id={props.id}>{title}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
}