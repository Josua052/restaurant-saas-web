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
  
  const hostname = req.headers.get("host") || "";
  
  const allowedRootDomains = ["namawebsite.com"];
  
  if (allowedRootDomains.includes(hostname)) {
    return NextResponse.next();
  }
  const domain = hostname.split(":")[0]; 
  return NextResponse.rewrite(new URL(`/${domain}${url.pathname}${url.search}`, req.url));
}
