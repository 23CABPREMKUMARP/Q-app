import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET(req: Request, { params }: { params: Promise<{ busId: string }> }) {
  try {
    const { busId } = await params;

    if (!busId) {
      return NextResponse.json({ success: false, error: "busId is required" }, { status: 400 });
    }

    const { data: bus, error } = await supabase
      .from("buses")
      .select("id, bus_number, bus_code, location, device_status, last_seen, trip_active, gps_enabled")
      .eq("id", busId)
      .single();

    if (error || !bus) {
      return NextResponse.json({ success: false, error: "Bus not found" }, { status: 404 });
    }

    const lastSeen = bus.last_seen ? new Date(bus.last_seen) : null;
    const now = new Date();
    const secondsSinceUpdate = lastSeen ? Math.floor((now.getTime() - lastSeen.getTime()) / 1000) : null;
    
    // Consider GPS offline if last update > 60 seconds ago
    const gpsOnline = bus.device_status === "Online" && secondsSinceUpdate !== null && secondsSinceUpdate < 60;

    return NextResponse.json({
      success: true,
      busId: bus.id,
      busNumber: bus.bus_number,
      busCode: bus.bus_code,
      location: bus.location || { lat: 11.0168, lng: 76.9558, speed: 0, heading: 0 },
      deviceStatus: gpsOnline ? "Online" : "Offline",
      gpsOnline,
      tripActive: bus.trip_active || false,
      gpsEnabled: bus.gps_enabled || false,
      lastSeen: bus.last_seen || null,
      secondsSinceUpdate,
    });
  } catch (error: any) {
    console.error("GPS Status Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
