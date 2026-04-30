import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(NextRequest) {
  const path = req.nextUrl.pathname;

  // read role from cookies (VERY IMPORTANT)
  const role = req.cookies.get("role")?.value;

  // 🔥 ONLY fix: prevent admin seeing user dashboard
  if (path === "/" && role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}
