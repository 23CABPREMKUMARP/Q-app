import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Bus from "@/src/models/Bus";
import Route from "@/src/models/Route";
import BusLocation from "@/src/models/BusLocation";

export async function GET() {
  try {
    try {
      await connectDB();
    } catch (dbError) {
      console.warn("Matrix Hub Link Offline: Switching to Simulation Data Protocol.");
      // Return simulation fleet if DB is disconnected
      return NextResponse.json([]); 
    }

    const buses = await Bus.find().populate({
      path: "routeId",
      populate: {
        path: "stops",
        model: "Stop",
      },
    });
    
    // Get latest location for each bus
    const busesWithLocation = await Promise.all(
      buses.map(async (bus) => {
        try {
          const latestLocation = await BusLocation.findOne({ busId: bus._id }).sort({ timestamp: -1 });
          return {
            ...bus.toObject(),
            location: latestLocation || { lat: 13.0827, lng: 80.2707 }, // Default to Chennai center
          };
        } catch (e) {
          return { ...bus.toObject(), location: { lat: 13.0827, lng: 80.2707 } };
        }
      })
    );

    return NextResponse.json(busesWithLocation);
  } catch (error) {
    console.error("Critical Bus Sync Error:", error);
    // Absolute fallback: Return empty so the frontend simulation can take over
    return NextResponse.json([]);
  }
}
