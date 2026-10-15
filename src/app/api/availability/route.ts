import { availability } from "@/lib/availability";
import { json } from "@/lib/api";

export async function GET() {
  return json(availability());
}
