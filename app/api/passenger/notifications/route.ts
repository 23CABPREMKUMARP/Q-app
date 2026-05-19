import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import TripNotification from "@/src/models/TripNotification";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: "Missing phone identifier" }, { status: 400 });
    }

    try {
      await connectDB();
      // Fetch notifications sorted by latest
      const notifications = await TripNotification.find({ phone })
        .populate("busId")
        .sort({ createdAt: -1 })
        .limit(10);

      return NextResponse.json({ success: true, notifications });
    } catch (dbError) {
      console.warn("DB offline. Returning empty notifications array.");
      return NextResponse.json({ success: true, notifications: [] });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
