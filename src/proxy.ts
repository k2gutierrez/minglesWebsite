import { NextResponse, type NextRequest } from "next/server";
import { RAFFLE_PUBLIC } from "@/lib/raffle-visibility";

/**
 * The raffle route is not public until launch. The page itself also redirects,
 * but this proxy returns a real HTTP redirect before Next renders or caches it.
 */
export function proxy(request: NextRequest) {
  if (
    !RAFFLE_PUBLIC &&
    request.nextUrl.pathname.startsWith("/apefest-raffle")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/apefest-raffle", "/apefest-raffle/:path*"],
};
