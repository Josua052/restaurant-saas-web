import { Metadata } from "next";
import TablesClient from "./TablesClient";

export const metadata: Metadata = {
  title: "Tables Management - Staff",
  description: "Manage restaurant tables and sessions.",
};

export default function StaffTablesPage() {
  return <TablesClient />;
}
