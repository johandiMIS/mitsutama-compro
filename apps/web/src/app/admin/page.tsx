import { redirect } from "next/navigation";

/** Hero config is the only section so far, so /admin lands straight on it. */
export default function AdminIndexPage() {
  redirect("/admin/hero");
}
