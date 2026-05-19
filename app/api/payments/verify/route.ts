import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/src/lib/db";
import Booking from "@/src/models/Booking";
import Bus from "@/src/models/Bus";
import Seat from "@/src/models/Seat";
import { supabaseFetch } from "@/src/lib/supabase";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails
    } = await req.json();

    console.log(`[Payment Verification] Processing Order: ${razorpay_order_id}`);

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Razorpay secret is missing in environment variables.");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error(`[Signature Mismatch] Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
      return NextResponse.json({ success: false, message: "Payment verification failed: Signature mismatch" }, { status: 400 });
    }

    // 2. Finalize Booking
    let newBooking = null;
    const ticketId = `JBN-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const qrToken = crypto.randomBytes(32).toString("hex");

    try {
      await connectDB();

      const {
        userId,
        busId,
        passengers,
        seats,
        totalAmount,
        boardingPoint,
        destination,
      } = bookingDetails;

      // Validate busId - if it's a mock bus (not 24 chars or not valid ObjectId), use a placeholder or handle gracefully
      const isValidObjectId = mongoose.Types.ObjectId.isValid(busId);
      
      const bookingData = {
        ticketId,
        userId: userId || "GUEST_LINK",
        busId: isValidObjectId ? busId : new mongoose.Types.ObjectId(), // Create a temp ID if mock bus to satisfy schema
        seats,
        totalAmount,
        boardingPoint,
        destination,
        passengers,
        paymentStatus: "Paid",
        qrToken,
        validationStatus: "Active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      };

      newBooking = new Booking(bookingData);
      await newBooking.save();
      console.log(`[Booking Saved] Ticket: ${ticketId}`);

      // Update seat availability only for real buses
      if (isValidObjectId) {
        await Seat.updateMany(
          { busId, seatNumber: { $in: seats } },
          { $set: { isBooked: true } }
        );

        await Bus.findByIdAndUpdate(busId, {
          $inc: { availableSeats: -seats.length },
        });
      }

      // Supabase Sync
      try {
        await supabaseFetch("bookings", "POST", {
          ticket_id: ticketId,
          user_id: userId || "GUEST_LINK",
          bus_id: busId || "SIM_BUS",
          seats: seats || ["S-1"],
          total_amount: totalAmount || 0,
          boarding_point: boardingPoint || "TRANSIT_HUB",
          destination: destination || "END_NODE",
          phone: passengers?.[0]?.phone || "N/A",
          qr_token: qrToken,
          status: "Confirmed"
        });
        console.log("[Supabase Sync] Success");
      } catch (supabaseError) {
        console.warn("[Supabase Sync Failure]", supabaseError);
      }

    } catch (dbError: any) {
      console.error("[Database Error During Verification]", dbError);
      // EMERGENCY FALLBACK: If payment is authentic but DB fails, still return success with temporary object
      // This prevents the user from being charged but seeing a "failed" screen.
      return NextResponse.json({
        success: true,
        message: "Payment verified (Emergency Mode)",
        booking: {
          ticketId,
          qrToken,
          busId: bookingDetails.busId,
          seats: bookingDetails.seats,
          totalAmount: bookingDetails.totalAmount,
          boardingPoint: bookingDetails.boardingPoint,
          destination: bookingDetails.destination,
          passengers: bookingDetails.passengers,
          isEmergency: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking: newBooking
    });

  } catch (error: any) {
    console.error("Critical Verification Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

