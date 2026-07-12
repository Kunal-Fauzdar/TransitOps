import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleAccess: Record<string, string[]> = {
  "/dashboard": ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst"],
  "/vehicles": ["FleetManager", "Driver"],
  "/drivers": ["FleetManager", "SafetyOfficer"],
  "/trips": ["FleetManager", "Driver"],
  "/maintenance": ["FleetManager"],
  "/reports": ["FinancialAnalyst", "FleetManager"],
};

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as any)?.role;
    const path = req.nextUrl.pathname;

    const matchedRoute = Object.keys(roleAccess).find((r) => path.startsWith(r));
    if (matchedRoute && role && !roleAccess[matchedRoute].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
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
  ],
};