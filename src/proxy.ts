import { auth } from "@/auth";

const PROTECTED_PATHS = [
  "/eshop/admin",
  "/dashboard",
  "/projects",
  "/analysis",
  "/audit",
  "/sessions",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected && !req.auth) {
    return Response.redirect(
      new URL(`/prihlaseni?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
    );
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
