import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Only protect admin and feedback routes (not vote)
const PROTECTED_KEY_ROUTES = ["/api/feedback", "/api/trades"];

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.pathname;

    // --- 1. Protect sensitive API routes with admin key ---
    const isProtected = PROTECTED_KEY_ROUTES.some((path) =>
      url.startsWith(path)
    );

    if (isProtected) {
      const adminKey = req.headers.get("x-admin-key");
      if (adminKey !== process.env.ADMIN_KEY) {
        console.warn(
          `Unauthorized attempt to access ${url} from IP: ${req.ip || "unknown"}`
        );
        return new NextResponse("Unauthorized Access", { status: 403 });
      }
    }

    // --- 2. Continue with NextAuth middleware for /admin pages ---
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const url = req.nextUrl.pathname;

        // Protect admin areas based on signed-in email
        if (url.startsWith("/admin") || url.startsWith("/api/admin")) {
          const allowed = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase());
          return (
            token && allowed.includes((token.email || "").toLowerCase())
          );
        }

        // All public pages (like voting) remain open
        return true;
      },
    },
  }
);

// --- 3. Middleware matcher ---
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/feedback/:path*", // Protected by admin key
  ],
};
