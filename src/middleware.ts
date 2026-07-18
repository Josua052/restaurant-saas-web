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

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const domain = hostname.split(":")[0]; 
  
  // 1. Token Refresh Logic
  const isAdmin = url.pathname.startsWith('/dashboard');
  const isStaff = url.pathname.includes('/staff');
  
  let accessCookieName = "access_token";
  let refreshCookieName = "refresh_token";
  
  if (isAdmin) {
    accessCookieName = "admin_access_token";
    refreshCookieName = "admin_refresh_token";
  } else if (isStaff) {
    accessCookieName = "staff_access_token";
    refreshCookieName = "staff_refresh_token";
  } else {
    accessCookieName = "owner_access_token";
    refreshCookieName = "owner_refresh_token";
  }

  const accessToken = req.cookies.get(accessCookieName)?.value;
  const refreshToken = req.cookies.get(refreshCookieName)?.value;

  // If access token is expired/missing but refresh token exists, attempt to refresh silently
  if (!accessToken && refreshToken) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        
        if (data.success && data.data) {
          const newAccessToken = data.data.access_token;
          const newRefreshToken = data.data.refresh_token;

          // Redirect back to the identical URL to force the browser to apply the new cookies
          // so Server Components can read them from the new request.
          const redirectRes = NextResponse.redirect(req.url);
          
          redirectRes.cookies.set({
            name: accessCookieName,
            value: newAccessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15, // 15 mins
          });

          if (newRefreshToken) {
             redirectRes.cookies.set({
               name: refreshCookieName,
               value: newRefreshToken,
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               sameSite: "strict",
               path: "/",
               maxAge: 60 * 60 * 24 * 7, // 7 days
             });
          }

          return redirectRes;
        }
      }
    } catch (error) {
      console.error("Middleware refresh token error:", error);
      // Fallthrough to normal routing if refresh request completely fails
    }
  }

  // 2. Domain & Tenant Routing Logic
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
