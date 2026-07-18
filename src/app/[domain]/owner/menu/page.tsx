import { cookies } from "next/headers";
import MenuClient from "./MenuClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function MenuPage({ params }: { params: Promise<{ domain: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";
  const { domain } = await params;

  let menus = [];
  let categories = [];

  if (token) {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch menus and categories concurrently
      const [menusRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/management/menus`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/management/menus/categories`, { headers, cache: "no-store" }),
      ]);

      if (menusRes.ok) {
        const menusJson = await menusRes.json();
        menus = menusJson.data || [];
      }

      if (categoriesRes.ok) {
        const categoriesJson = await categoriesRes.json();
        categories = categoriesJson.data || [];
      }
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    }
  }

  return <MenuClient domain={domain} menus={menus} categories={categories} token={token} />;
}
