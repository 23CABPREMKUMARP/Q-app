import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET() {
  try {
    const { data: buses, error } = await supabase
      .from('buses')
      .select('*, routes(*, stops(*))');
    
    if (error || !buses || buses.length === 0) {
      console.warn("Matrix Hub Link Offline or Empty: Switching to Simulation Data Protocol.");
      const { MOCK_BUSES } = require("@/src/lib/constants");
      return NextResponse.json(MOCK_BUSES); 
    }

    const formattedBuses = buses.map(bus => ({
      ...bus,
      _id: bus.id,
      busNumber: bus.bus_number,
      routeId: bus.routes,
      departureTime: bus.departure_time,
      arrivalTime: bus.arrival_time,
      availableSeats: bus.available_seats,
      location: bus.location || { lat: 13.0827, lng: 80.2707 } // Default to Chennai center
    }));

    return NextResponse.json(formattedBuses);
  } catch (error) {
    console.error("Critical Bus Sync Error:", error);
    return NextResponse.json([]);
  }
}
