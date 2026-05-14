import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/src/lib/db";
import Booking from "@/src/models/Booking";
import Bus from "@/src/models/Bus";
import Seat from "@/src/models/Seat";
import { supabaseFetch } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails
    } = await req.json();

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
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }

    // 2. Finalize Booking (Logic migrated from api/bookings/route.ts)
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

    const ticketId = `JBN-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const qrToken = crypto.randomBytes(32).toString("hex");

    const bookingData = {
      ticketId,
      userId: userId || "GUEST_LINK",
      busId,
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

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    // Update seat availability
    if (busId && busId.length === 24) {
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
    } catch (supabaseError) {
      console.warn("Supabase Sync Failure:", supabaseError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking: newBooking
    });

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
