import BranchesClient from "./BranchesClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Branch Management - SaaS Restaurant",
};

export default function BranchesPage() {
  return <BranchesClient />;
}
