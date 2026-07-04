import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { busId, conductorId, lat, lng, speed = 0, heading = 0 } = body;

    if (!busId || !lat || !lng) {
      return NextResponse.json({ success: false, error: "busId, lat, lng are required" }, { status: 400 });
    }

    // Validate that conductor is assigned to this bus
    if (conductorId) {
      const { data: assignment } = await supabase
        .from("conductor_assignments")
        .select("assigned_bus")
        .eq("employee_id", conductorId)
        .eq("status", "Active")
        .single();

      // If there is a record but bus doesn't match, reject
      if (assignment && assignment.assigned_bus && assignment.assigned_bus !== busId) {
        return NextResponse.json(
          { success: false, error: "Conductor is not assigned to this bus" },
          { status: 403 }
        );
      }
    }

    const locationPayload = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed) || 0,
      heading: parseFloat(heading) || 0,
    };

    const now = new Date().toISOString();

    // Update bus location in Supabase buses table
    const { error: updateError } = await supabase
      .from("buses")
      .update({
        location: locationPayload,
        device_status: "Online",
        last_seen: now,
        trip_active: true,
      })
      .eq("id", busId);

    if (updateError) {
      // Non-fatal: Supabase may not have the columns yet. Log and continue.
      console.warn("GPS update warning (may need schema migration):", updateError.message);
    }

    // Broadcast via Supabase Realtime to all listening passengers
    const payload = {
      busId,
      ...locationPayload,
      timestamp: now,
      deviceStatus: "Online",
    };

    await supabase.channel(`gps:${busId}`).send({
      type: "broadcast",
      event: "location",
      payload
    });

    // Also broadcast to the global fleet channel
    await supabase.channel(`gps:fleet`).send({
      type: "broadcast",
      event: "location",
      payload
    });

    return NextResponse.json({
      success: true,
      message: "GPS location updated",
      location: locationPayload,
      timestamp: now,
    });
  } catch (error: any) {
    console.error("GPS Update Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}
