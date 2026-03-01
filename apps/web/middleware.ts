import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { shouldRedirectToLogin } from "@/lib/route-access";

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user);

  if (shouldRedirectToLogin(request.nextUrl.pathname, isAuthenticated)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/teams/:path*", "/invite/:path*"]
};
