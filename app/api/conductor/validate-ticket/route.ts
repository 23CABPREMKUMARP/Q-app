import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const { token, scannedBy, location } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    let searchVal = token;

    // Handle full URLs from the boarding pass QR
    if (typeof token === 'string' && token.includes('jeffben.org/ticket/')) {
      searchVal = token.split('jeffben.org/ticket/')[1].trim();
    }
    let isTicketId = false;
    let isSerialKey = false;

    if (typeof token === 'string' && token.toUpperCase().startsWith("JB-")) {
      searchVal = token.substring(3).trim();
      isSerialKey = true;
    }

    let booking = null;
    let fetchError = null;

    if (isSerialKey) {
      // Query by ticket_id ending with or containing the serial suffix
      const { data, error } = await supabase
        .from('town_bus_bookings')
        .select('*')
        .ilike('ticket_id', `%${searchVal}`)
        .limit(1)
        .maybeSingle();
      booking = data;
      fetchError = error;
    } else {
      // Try parsing if base64 (for newer QR codes)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (parsed && parsed.t) {
          searchVal = parsed.t;
          isTicketId = true;
        } else if (parsed && parsed.busId && parsed.auth === "JEFFBEN-SYNC") {
          return NextResponse.json({ success: false, message: "Scanned Bus QR, not a ticket" }, { status: 400 });
        }
      } catch (e) {
        // It's a plain qrToken
      }

      const queryColumn = isTicketId ? 'ticket_id' : 'qr_token';
      const { data, error } = await supabase
        .from('town_bus_bookings')
        .select('*')
        .eq(queryColumn, searchVal)
        .maybeSingle();
      booking = data;
      fetchError = error;

      // Fallback: If not found by qr_token, check if they typed the ticket_id directly
      if (!booking && queryColumn === 'qr_token') {
        const { data: fallbackData } = await supabase
          .from('town_bus_bookings')
          .select('*')
          .eq('ticket_id', searchVal)
          .maybeSingle();
        if (fallbackData) {
          booking = fallbackData;
          fetchError = null;
        }
      }
    }

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, message: "Invalid Ticket - Not Found" }, { status: 404 });
    }

    // Validation Logic
    const bookingTimeMs = new Date(booking.booking_date).getTime();
    const isExpired = Date.now() > bookingTimeMs + 7200000; // 2 hours

    if (booking.validation_status === "Used") {
      return NextResponse.json({ 
        success: false, 
        message: "Ticket Already Used", 
        booking: {
          ticketId: booking.ticket_id,
          status: "Used"
        }
      });
    }

    if (booking.validation_status === "Cancelled" || booking.status === "Cancelled") {
      return NextResponse.json({ success: false, message: "Ticket Cancelled", booking: { ticketId: booking.ticket_id } });
    }

    if (booking.validation_status === "Expired" || isExpired) {
      if (booking.validation_status !== "Expired") {
        await supabase.from('town_bus_bookings').update({ validation_status: "Expired" }).eq('id', booking.id);
      }
      return NextResponse.json({ success: false, message: "Ticket Expired", booking: { ticketId: booking.ticket_id } });
    }

    // Mark as Used
    await supabase.from('town_bus_bookings').update({ 
      validation_status: "Used",
      // If we had a scanHistory column we could append it here, omit for simplicity or map to a different table
    }).eq('id', booking.id);

    return NextResponse.json({
      success: true,
      message: "Ticket Validated Successfully",
      booking: {
        ticketId: booking.ticket_id,
        route: `${booking.boarding_point} → ${booking.destination}`,
        seats: booking.seats?.length || 1,
        boardingPoint: booking.boarding_point,
        status: "Valid"
      }
    });

  } catch (error) {
    console.error("QR Validation Error:", error);
    return NextResponse.json({ success: false, message: "Server Error during validation" }, { status: 500 });
  }
}
