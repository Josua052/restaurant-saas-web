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

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const domain = hostname.split(":")[0]; 
  
  const allowedRootDomains = ["namawebsite.com", "localhost", "127.0.0.1"];
  const isLocalIP = domain.startsWith("192.168.");
  
  // If it's the root application domain
  if (allowedRootDomains.includes(domain) || isLocalIP) {
    // Redirect root to login
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }
  
  // For tenant subdomains, rewrite to /[domain]/...
  return NextResponse.rewrite(new URL(`/${domain}${url.pathname}${url.search}`, req.url));
}
