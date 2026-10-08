import { redirect } from "next/navigation";

/** /admin lands on the page tree, the most-used screen. */
export default function AdminIndexPage() {
  redirect("/admin/pages");
}
