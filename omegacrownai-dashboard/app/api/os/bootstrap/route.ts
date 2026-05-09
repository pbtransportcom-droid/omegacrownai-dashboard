import { NextResponse } from "next/server";
import { bootstrapSugentOS } from "@/lib/sugent/bootstrap";

export function POST() {
  return NextResponse.json(bootstrapSugentOS());
}

export function GET() {
  return NextResponse.json(bootstrapSugentOS());
}
