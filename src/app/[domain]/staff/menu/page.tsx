import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StaffMenuClient from "./StaffMenuClient";

export default async function StaffMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { domain } = await params;
  const resolvedSearchParams = await searchParams;

  const page =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page, 10)
      : 1;
  const categoryId =
    typeof resolvedSearchParams.category_id === "string"
      ? resolvedSearchParams.category_id
      : "";

  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    redirect(`/${domain}/login`);
  }

  const headers = { Authorization: `Bearer ${token}` };

  let categories: any[] = [];
  let menuItems: any[] = [];
  let meta: any = null;
  let currency = "IDR";

  try {
    const categoriesUrl = `${API_URL}/management/menus/categories`;
    let menusUrl = `${API_URL}/management/menus?page=${page}&limit=12`;
    if (categoryId) {
      menusUrl += `&category_id=${categoryId}`;
    }
    const profileUrl = `${API_URL}/management/auth/me`;

    const [resCategories, resMenus, resProfile] = await Promise.all([
      fetch(categoriesUrl, { headers, cache: "no-store" }),
      fetch(menusUrl, { headers, cache: "no-store" }),
      fetch(profileUrl, { headers, cache: "no-store" }),
    ]);

    if (resCategories.status === 401 || resMenus.status === 401) {
      redirect(`/${domain}/login`);
    }

    if (resCategories.ok) {
      const jsonCat = await resCategories.json();
      categories = jsonCat.data || [];
    }
    if (resMenus.ok) {
      const jsonMen = await resMenus.json();
      menuItems = jsonMen.data || [];
      meta = jsonMen.meta || { current_page: 1, total_pages: 1 };
    }
    if (resProfile.ok) {
      const jsonProf = await resProfile.json();
      currency = jsonProf.data?.currency || "IDR";
    }
  } catch (error: any) {
    console.error("Staff Menu Fetch Error:", error);
  }

  return (
    <StaffMenuClient
      domain={domain}
      token={token}
      initialCategories={categories}
      initialMenuItems={menuItems}
      initialMeta={meta}
      currency={currency}
    />
  );
}
