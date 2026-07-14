import { cookies } from "next/headers";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  return <EmployeesClient token={token} />;
}
