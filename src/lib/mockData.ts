/**
 * Mock Data for Demo/Portfolio Mode
 * Digunakan ketika NEXT_PUBLIC_ENABLE_MOCK="true" atau ketika backend database tidak aktif.
 */

export const mockSuperAdminProfile = {
  id: "usr_admin_demo",
  name: "Super Admin (Demo)",
  email: "admin@saas-restaurant.com",
  role: "superadmin",
};

export const mockSuperAdminStats = {
  total_tenants: 28,
  active_tenants: 24,
  new_this_month: 6,
  recent_tenants: [
    {
      id: "t_001",
      restaurant_name: "Gusto Bistro & Lounge",
      slug: "gusto-bistro",
      status: 1,
      created_at: "2026-02-15T08:30:00Z",
      branch_name: "Main Branch (Senopati)",
      address: "Jl. Senopati, Jakarta Selatan",
      owner_name: "Elena Ross Power",
      owner_email: "elena@gustobistro.com",
      owner_phone: "+6281234567890",
    },
    {
      id: "t_002",
      restaurant_name: "Noodle Master Co.",
      slug: "noodle-master",
      status: 1,
      created_at: "2026-02-18T10:15:00Z",
      branch_name: "Grand Indonesia Mall",
      address: "Grand Indonesia West Mall, Jakarta Pusat",
      owner_name: "Aji Aja",
      owner_email: "aji aja@noodle-master.com",
      owner_phone: "+6281398765432",
    },
    {
      id: "t_003",
      restaurant_name: "Café Noir Artisan",
      slug: "cafe-noir",
      status: 1,
      created_at: "2026-02-20T14:45:00Z",
      branch_name: "Dharmawangsa Outlet",
      address: "Jl. Dharmawangsa, Jakarta Selatan",
      owner_name: "Sarah Jenkins",
      owner_email: "sarah@cafenoir.id",
      owner_phone: "+6281122334455",
    },
    {
      id: "t_004",
      restaurant_name: "Slice & Crust Pizza",
      slug: "slice-crust",
      status: 0,
      created_at: "2026-01-10T11:00:00Z",
      branch_name: "PIK Pantjoran",
      address: "Pantjoran PIK , Jakarta Utara",
      owner_name: "Marcus DunnDunn Slice",
      owner_email: "marcus@slicecrust.com",
      owner_phone: "+6281987654321",
    },
    {
      id: "t_005",
      restaurant_name: "El Camino Tapas Bar",
      slug: "el-camino",
      status: 1,
      created_at: "2026-02-22T16:20:00Z",
      branch_name: "Kemang Branch",
      address: "Jl. Kemang Raya No. 88, Jakarta Selatan",
      owner_name: "David Rodriguez",
      owner_email: "david@elcamino.com",
      owner_phone: "+6281765432109",
    },
  ],
};

export const mockTenantOwnerDashboard = {
  summary: {
    today_revenue: 14250000,
    yesterday_revenue: 12800000,
    growth_pct: 11.3,
    total_orders_today: 94,
    active_tables: 16,
    total_tables: 24,
    avg_order_value: 151500,
  },
  sales_chart: [
    { time: "10:00", sales: 850000, orders: 6 },
    { time: "12:00", sales: 3400000, orders: 22 },
    { time: "14:00", sales: 2100000, orders: 14 },
    { time: "16:00", sales: 1200000, orders: 8 },
    { time: "18:00", sales: 2900000, orders: 19 },
    { time: "20:00", sales: 3800000, orders: 25 },
  ],
  top_dishes: [
    { name: "Truffle Tagliatelle", orders: 42, revenue: 3780000 },
    { name: "Wagyu Ribeye Steak 200g", orders: 28, revenue: 5320000 },
    { name: "Crispy Calamari", orders: 35, revenue: 1925000 },
    { name: "Tiramisu Tradizionale", orders: 31, revenue: 1395000 },
    { name: "Matcha Latte Ice", orders: 48, revenue: 1440000 },
  ],
  table_status: [
    { id: "T-01", name: "Table 1 (Indoor)", status: "Occupied", guests: 4, amount: 485000 },
    { id: "T-02", name: "Table 2 (Indoor)", status: "Available", guests: 0, amount: 0 },
    { id: "T-03", name: "Table 3 (Window)", status: "Occupied", guests: 2, amount: 240000 },
    { id: "T-04", name: "Table 4 (VIP Room)", status: "Reserved", guests: 8, amount: 1500000 },
    { id: "T-05", name: "Table 5 (Outdoor)", status: "Occupied", guests: 3, amount: 360000 },
    { id: "T-06", name: "Table 6 (Outdoor)", status: "Available", guests: 0, amount: 0 },
  ],
};
