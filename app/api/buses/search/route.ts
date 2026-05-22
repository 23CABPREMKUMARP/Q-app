import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Bus from "@/src/models/Bus";
import { MOCK_BUSES } from "@/src/lib/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, message: "Code required" }, { status: 400 });
    }

    let bus = null;
    let dbConnected = false;

    try {
      await connectDB();
      dbConnected = true;
    } catch (e) {
      console.warn("DB offline. Using mock query fallback.");
    }

    if (dbConnected) {
      try {
        bus = await Bus.findOne({ busCode: code.toUpperCase() }).populate({
          path: "routeId",
          populate: {
            path: "stops",
            model: "Stop",
          },
        });
      } catch (queryError) {
        console.error("Database query failed:", queryError);
      }
    }

    if (!bus) {
      // Look up in MOCK_BUSES
      const mockBus = MOCK_BUSES.find(b => b.busCode === code.toUpperCase());
      if (mockBus) {
        return NextResponse.json({ success: true, bus: mockBus });
      }
    }

    if (!bus) {
      return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bus });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
