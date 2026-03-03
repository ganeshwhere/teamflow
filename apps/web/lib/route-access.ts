const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_PREFIXES = ["/api/auth"];
const PROTECTED_PREFIXES = ["/dashboard", "/teams", "/projects", "/invite"];

export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldRedirectToLogin(pathname: string, isAuthenticated: boolean): boolean {
  if (isAuthenticated || isPublicPath(pathname)) {
    return false;
  }

  return isProtectedPath(pathname);
}
