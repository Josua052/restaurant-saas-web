import { cookies } from "next/headers";
import AddMenuClient from "./AddMenuClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export default async function AddMenuItemPage({ params }: { params: { domain: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  let categories = [];

  if (token) {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch categories
      const categoriesRes = await fetch(`${API_URL}/management/menus/categories`, { headers, cache: "no-store" });

      if (categoriesRes.ok) {
        const categoriesJson = await categoriesRes.json();
        categories = categoriesJson.data || [];
      }

    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  return <AddMenuClient domain={params.domain} categories={categories} token={token} />;
}
