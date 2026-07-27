import Link, { LinkProps } from "next/link";

export function ButtonLink(
  props: LinkProps & { children: React.ReactNode; className?: string }
) {
  return <Link {...props} />;
}