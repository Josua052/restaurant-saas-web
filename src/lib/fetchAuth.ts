/**
 * A wrapper around native fetch that automatically attempts to refresh the token
 * if a 401 Unauthorized response is received.
 */
export async function fetchAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Setup headers
  const headers = new Headers(init?.headers);
  
  // Inject X-Branch-ID if available in localStorage
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const domain = currentPath.split('/')[1];
    let activeBranchId = null;
    
    if (domain && domain !== 'dashboard' && domain !== 'login') {
      activeBranchId = localStorage.getItem(`active_branch_id_${domain}`);
    }
    if (!activeBranchId) {
      activeBranchId = localStorage.getItem("active_branch_id");
    }

    if (activeBranchId) {
      headers.set("X-Branch-ID", activeBranchId);
    }
  }

  // Create new init object with updated headers
  const newInit: RequestInit = {
    ...init,
    headers,
  };

  let response = await fetch(input, newInit);

  // If the token is expired or unauthorized
  if (response.status === 401) {
    try {
      // Determine scope based on URL path
      const scope = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard') 
        ? "admin" 
        : "tenant";

      // Attempt to refresh the token using our internal API route
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope }),
      });

      if (refreshResponse.ok) {
        // If refresh was successful, the Next.js API route has updated the HTTP-Only cookies.
        response = await fetch(input, newInit);
      } else {
        // Refresh failed, check why
        let isSuspended = false;
        try {
          const refreshData = await refreshResponse.json();
          isSuspended = refreshData.isSuspended === true;
        } catch (e) {
          // Ignore JSON parse error if any
        }

        if (typeof window !== 'undefined') {
          // Redirect to login, appending suspended query param if needed
          // We can use the current domain scope if it's a tenant login
          const currentPath = window.location.pathname;
          let redirectUrl = "/login";
          
          if (!currentPath.startsWith('/dashboard')) {
             const domain = currentPath.split('/')[1];
             if (domain && domain !== 'login') {
               redirectUrl = `/${domain}/login`;
             }
          }

          if (isSuspended) {
            redirectUrl += "?suspended=true";
          }
          
          window.location.href = redirectUrl;
        }
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  return response;
}
