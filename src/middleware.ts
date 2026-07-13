import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get("host") || "";
  
  // Define our allowed root domains (the SaaS super admin domain)
  // In production, this would be your real domain, e.g. "namawebsite.com"
  const allowedRootDomains = ["localhost:3000", "namawebsite.com"];
  
  // If the request is for the main domain, let it pass through normally
  if (allowedRootDomains.includes(hostname)) {
    return NextResponse.next();
  }

  // Otherwise, it's a tenant custom domain or subdomain!
  // We rewrite the URL to /app/[domain]/[path]
  
  // Extract just the domain part if it has a port (e.g. kopi.localhost:3000 -> kopi.localhost)
  // But wait, the folder name will literally be the host string. Let's just use the full hostname.
  // Actually, usually it's cleaner to remove the port for the folder routing, 
  // but to keep it simple, we can just pass the raw hostname or strip the port.
  const domain = hostname.split(":")[0]; 
  
  // Rewrite the request to the dynamic `[domain]` folder
  // Example: kopia.com/login -> /[domain]/login where params.domain = "kopia.com"
  return NextResponse.rewrite(new URL(`/${domain}${url.pathname}${url.search}`, req.url));
}
