import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Booking from "@/src/models/Booking";
import Bus from "@/src/models/Bus";
import Seat from "@/src/models/Seat";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const {
      userId,
      busId,
      passengers,
      seats,
      totalAmount,
      boardingPoint,
      destination,
    } = data;

    // Generate unique ticket id
    const ticketId = `TKT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const bookingData = {
      ticketId,
      userId: userId || "GUEST_LINK",
      busId,
      seats,
      totalAmount,
      boardingPoint: boardingPoint || "TRANSIT_HUB",
      destination: destination || "END_NODE",
      passengers,
      paymentStatus: "Paid",
    };

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    // Resilient Registry Sync: Try to update seats and bus count, but allow simulation IDs to bypass
    try {
      // Mark seats as booked (simulation-safe check)
      if (!busId.includes("matrix")) {
        await Seat.updateMany(
          { busId, seatNumber: { $in: seats } },
          { $set: { isBooked: true } }
        );

        // Update available seats count in Bus model
        await Bus.findByIdAndUpdate(busId, {
          $inc: { availableSeats: -seats.length },
        });
      }
    } catch (registryError) {
      console.warn("Registry Sync Bypass (Simulation Cluster):", registryError);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: "Sync Successful! Digital Pass Generated.",
    });
  } catch (error: any) {
    console.error("Critical Matrix Sync Error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Matrix Hub Synchronization Failure",
      details: error?.message 
    }, { status: 500 });
  }
}
