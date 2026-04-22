import { pwaPngIconResponse } from "@/lib/pwaPngIcon";

export async function GET() {
  return pwaPngIconResponse(192);
}
