import { redirect } from "next/navigation";

/**
 * Management reporting now lives in its own portal at `/management`, alongside
 * /admin and /employees. This stub used to render an empty "no metrics" panel;
 * it redirects to the real dashboard so old bookmarks and nav links still land
 * somewhere useful. Admins qualify as `CurrentManager`, so access is unchanged.
 */
export default function AdminManagementRedirect() {
  redirect("/management/dashboard");
}
