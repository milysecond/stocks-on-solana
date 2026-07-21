import { NextResponse } from "next/server";

export const runtime = "edge";

const FLASH_URL = "https://www.flash.trade?referral=newuser";

export function GET() {
  return NextResponse.redirect(FLASH_URL, 307);
}
