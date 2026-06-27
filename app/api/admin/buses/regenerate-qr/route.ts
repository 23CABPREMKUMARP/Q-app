import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const { busId } = await req.json();

    if (!busId) {
      return NextResponse.json({ error: "Missing busId" }, { status: 400 });
    }

    const { data: bus, error: fetchError } = await supabase
      .from('buses')
      .select('*')
      .eq('id', busId)
      .single();

    if (fetchError || !bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    // Generate a unique bus code if it doesn't have one
    let newBusCode = bus.bus_code;
    if (!newBusCode || newBusCode.startsWith("B-")) {
      const randomInt = Math.floor(100 + Math.random() * 900);
      newBusCode = `TNB${randomInt}`;
    }

    const qrCodeUrl = `https://app-woad-beta.vercel.app/town-bus/${newBusCode}/seat-selection`;
    
    const { data: updatedBus, error: updateError } = await supabase
      .from('buses')
      .update({ bus_code: newBusCode, qr_code_url: qrCodeUrl })
      .eq('id', busId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, bus: updatedBus });
  } catch (error) {
    console.error("Error regenerating QR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
