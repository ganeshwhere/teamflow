import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user);

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/teams/:path*", "/invite/:path*"]
};
