/**
 * A wrapper around native fetch that automatically attempts to refresh the token
 * if a 401 Unauthorized response is received.
 */
export async function fetchAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let response = await fetch(input, init);

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
        // We can now retry the original request.
        
        // Note: For requests like POST that consume a body stream, retrying native fetch
        // might fail if the body was already consumed or is a stream. For typical JSON requests
        // where `init.body` is a string, it will work fine.
        response = await fetch(input, init);
      } else {
        // Refresh failed, meaning the session is truly expired
        // You might want to redirect to login here, or let the component handle it
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  return response;
}
