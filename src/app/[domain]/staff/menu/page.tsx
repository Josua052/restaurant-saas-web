import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

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
  let fetchError = null;
  let currency = "IDR";

  try {
    // Construct URLs
    const categoriesUrl = `${API_URL}/management/menus/categories`;
    let menusUrl = `${API_URL}/management/menus?page=${page}&limit=12`;
    if (categoryId) {
      menusUrl += `&category_id=${categoryId}`;
    }
    const profileUrl = `${API_URL}/management/auth/me`;

    // Fetch endpoints concurrently
    const [resCategories, resMenus, resProfile] = await Promise.all([
      fetch(categoriesUrl, { headers, cache: "no-store" }),
      fetch(menusUrl, { headers, cache: "no-store" }),
      fetch(profileUrl, { headers, cache: "no-store" }),
    ]);

    if (resCategories.status === 401 || resMenus.status === 401) {
      redirect(`/${domain}/login`);
    }

    if (!resCategories.ok || !resMenus.ok) {
      fetchError = "Failed to load menu data from the server.";
    } else {
      const jsonCat = await resCategories.json();
      const jsonMen = await resMenus.json();
      categories = jsonCat.data || [];
      menuItems = jsonMen.data || [];
      meta = jsonMen.meta || { current_page: 1, total_pages: 1 };
    }

    if (resProfile.ok) {
      const jsonProf = await resProfile.json();
      currency = jsonProf.data?.currency || "IDR";
    }
  } catch (error: any) {
    console.error("Staff Menu Fetch Error:", error);
    fetchError = "Network error. Make sure the backend is running.";
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // Typical for IDR to not show decimals
    }).format(value);
  };

  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.total_pages || 1;

  // Helper to generate URLs for links
  const createPageUrl = (newPage: number) => {
    let url = `/${domain}/staff/menu?page=${newPage}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    return url;
  };

  const createCategoryUrl = (catId: string) => {
    if (!catId) return `/${domain}/staff/menu?page=1`;
    return `/${domain}/staff/menu?page=1&category_id=${catId}`;
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Sticky Header Area */}
      <div className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-slate-200 px-6 py-4 space-y-4 shadow-sm">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Menu
          </h1>
          <p className="text-slate-500 mt-1">
            Browse available items and pricing.
          </p>
        </div>

        {/* Categories Filter (Pills) */}
        <div className="flex flex-wrap gap-2">
          {/* All Category Pill */}
          <Link
            href={createCategoryUrl("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              !categoryId
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All
          </Link>

          {/* Dynamic Categories */}
          {categories.map((cat) => (
            <Link
              key={cat.ID}
              href={createCategoryUrl(cat.ID)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                categoryId === cat.ID
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat.Name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 pb-12 space-y-6 animate-in fade-in duration-500">
        {fetchError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{fetchError}</p>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {menuItems.map((item) => (
            <div
              key={item.ID}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              {/* Image Area */}
              <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {item.ImageURL ? (
                  <img
                    src={item.ImageURL}
                    alt={item.Name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      item.IsAvailable !== false
                        ? "group-hover:scale-105"
                        : "opacity-70 grayscale-[30%]"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}

                {/* Status Badge */}
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded flex items-center gap-1.5 backdrop-blur-md shadow-sm text-[10px] font-bold tracking-wider uppercase ${
                    item.IsAvailable !== false
                      ? "bg-white/90 text-emerald-700"
                      : "bg-white/90 text-rose-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.IsAvailable !== false
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  ></span>
                  {item.IsAvailable !== false ? "Available" : "Sold Out"}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {item.Name}
                  </h3>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(item.Price || 0)}
                  </span>
                </div>
                {item.Description && (
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {item.Description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {menuItems.length === 0 && !fetchError && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <AlertCircle className="w-8 h-8 mb-3 text-slate-400" />
              <p className="font-medium text-slate-600">No menu items found.</p>
              <p className="text-sm mt-1">
                Try selecting a different category.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
            <div className="text-sm text-slate-500 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 font-medium text-sm cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 font-medium text-sm cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
