import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET() {
  try {
    const { data: buses, error } = await supabase
      .from('buses')
      .select('*, routes(*, stops(*))');
    
    if (error || !buses || buses.length === 0) {
      console.warn("Matrix Hub Link Offline or Empty: Switching to Simulation Data Protocol.");
      return NextResponse.json([
        {
          _id: "TN38AB1234",
          id: "TN38AB1234",
          busNumber: "TN38AB1234",
          busCode: "1024",
          status: "Scheduled",
          speed: 0,
          availableSeats: 40,
          deviceStatus: "Offline",
          tripActive: false,
          location: { lat: 11.0168, lng: 76.9558 },
          routeId: {
            stops: [
              { lat: 11.0168, lng: 76.9558 },
              { lat: 11.0120, lng: 76.9700 },
              { lat: 11.0250, lng: 76.9850 },
              { lat: 11.0380, lng: 77.0010 },
              { lat: 11.0100, lng: 77.0200 },
              { lat: 10.9950, lng: 76.9600 }
            ]
          }
        }
      ]); 
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
