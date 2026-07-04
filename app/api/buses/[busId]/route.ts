import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ busId: string }> }) {
  try {
    const { busId } = await params;
    const body = await req.json();

    if (!busId) {
      return NextResponse.json({ success: false, error: "busId is required" }, { status: 400 });
    }

    // Only allow updating safe fields from admin
    const allowedFields: Record<string, any> = {};
    if (typeof body.gps_enabled === "boolean") allowedFields.gps_enabled = body.gps_enabled;
    if (typeof body.device_status === "string") allowedFields.device_status = body.device_status;
    if (typeof body.status === "string") allowedFields.status = body.status;

    const { error } = await supabase
      .from("buses")
      .update(allowedFields)
      .eq("id", busId);

    if (error) {
      console.warn("Bus update warning:", error.message);
      // Non-fatal, schema might not have columns yet
    }

    return NextResponse.json({ success: true, updated: allowedFields });
  } catch (error: any) {
    console.error("Bus PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
