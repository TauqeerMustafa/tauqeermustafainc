import Link, { LinkProps } from "next/link";

export function TextLink(
  props: LinkProps & { children: React.ReactNode; className?: string }
) {
  return <Link {...props} />;
}