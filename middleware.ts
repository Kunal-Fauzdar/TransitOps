import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleAccess: Record<string, string[]> = {
  "/dashboard": ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst"],
  "/vehicles": ["FleetManager", "Driver"],
  "/drivers": ["FleetManager", "SafetyOfficer"],
  "/trips": ["FleetManager", "Driver"],
  "/maintenance": ["FleetManager"],
  "/reports": ["FinancialAnalyst", "FleetManager"],
  "/live-map": ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst"],
  "/settings": ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string | undefined;
    const matchedRoute = Object.keys(roleAccess).find((r) => path.startsWith(r));

    if (matchedRoute && role && !roleAccess[matchedRoute].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/drivers/:path*",
    "/trips/:path*",
    "/maintenance/:path*",
    "/reports/:path*",
    "/live-map/:path*",
    "/settings/:path*",
  ],
};
