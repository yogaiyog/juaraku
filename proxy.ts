import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const protectedRoutes = ["/editor"];
const publicRoutes = ["/editor/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (isPublicRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/editor";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !isPublicRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/editor/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
