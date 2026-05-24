import { NextResponse } from "next/server";
import { supabaseFetch } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const { token, scannedBy, location } = await req.json();

    console.log("=== VALIDATE TICKET START ===");
    console.log("Raw Token:", token);

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    let searchColumn = "qr_token";
    let searchValue = token;

    try {
      // Try to decode base64 JSON if it's from the new generated QR codes
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      console.log("Decoded Token:", decoded);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.t) {
        searchColumn = "ticket_id";
        searchValue = parsed.t;
      } else if (parsed && parsed.busId && parsed.auth === "JEFFBEN-SYNC") {
        // Handle the bus ID QR code if needed
        return NextResponse.json({ success: false, message: "Scanned Bus QR, not a ticket" }, { status: 400 });
      }
    } catch (e) {
      console.log("Base64 parsing failed, using as plain qr_token. Error:", e);
      // If parsing fails, it's a plain qr_token
    }

    console.log(`Searching Supabase: column=${searchColumn}, value=${searchValue}`);

    // 1. Fetch booking from Supabase
    let bookingData;
    try {
      const results = await supabaseFetch("bookings", "GET", undefined, `select=*&${searchColumn}=eq.${encodeURIComponent(searchValue)}`);
      console.log("Supabase Fetch Results Length:", results ? results.length : 0);
      if (results && results.length > 0) {
        bookingData = results[0];
      }
    } catch (sbError) {
      console.warn("Supabase fetch error:", sbError);
      return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 });
    }

    if (!bookingData) {
      console.log("Booking not found for searchValue:", searchValue);
      return NextResponse.json({ success: false, message: "Invalid Ticket - Not Found" }, { status: 404 });
    }

    // 2. Validation Logic
    
    // Automatic 2-hour expiration rule
    const bookingTime = bookingData.booking_date || bookingData.created_at;
    const bookingTimeMs = bookingTime ? new Date(bookingTime).getTime() : Date.now();
    if (Date.now() > bookingTimeMs + 7200000) { // 2 hours
      return NextResponse.json({ 
        success: false, 
        message: "Ticket Expired", 
        booking: { ticketId: bookingData.ticket_id } 
      });
    }

    if (bookingData.status === "Used") {
      return NextResponse.json({ 
        success: false, 
        message: "Ticket Already Used", 
        booking: {
          ticketId: bookingData.ticket_id,
          status: "Used",
          usedAt: bookingData.updated_at || "N/A"
        }
      });
    }

    if (bookingData.status === "Cancelled") {
      return NextResponse.json({ success: false, message: "Ticket Cancelled", booking: { ticketId: bookingData.ticket_id } });
    }

    if (bookingData.status === "Expired") {
      return NextResponse.json({ success: false, message: "Ticket Expired", booking: { ticketId: bookingData.ticket_id } });
    }

    // 3. Mark as Used in Supabase
    try {
      await supabaseFetch("bookings", "PATCH", { status: "Used" }, `qr_token=eq.${encodeURIComponent(token)}`);
    } catch (sbError) {
      console.warn("Supabase update error:", sbError);
      return NextResponse.json({ success: false, message: "Failed to update ticket status" }, { status: 500 });
    }

    // 4. Return success response
    return NextResponse.json({
      success: true,
      message: "Ticket Validated Successfully",
      booking: {
        ticketId: bookingData.ticket_id,
        bus: bookingData.bus_id,
        route: `${bookingData.boarding_point} → ${bookingData.destination}`,
        seats: bookingData.seats,
        boardingPoint: bookingData.boarding_point,
        status: "Valid"
      }
    });

  } catch (error) {
    console.error("QR Validation Error:", error);
    return NextResponse.json({ success: false, message: "Server Error during validation" }, { status: 500 });
  }
}
