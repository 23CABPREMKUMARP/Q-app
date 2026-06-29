import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = body.phone;

    if (!phone) {
       console.log("[Search Failure] Phone number missing in payload.");
       return NextResponse.json([]);
    }

    console.log(`[Supabase Search] Initiated for: ${phone}`);

    const digits = phone.replace(/\D/g, "");
    const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;

    if (!cleanPhone) {
        console.log("[Search Failure] Phone number missing/invalid in payload.");
        return NextResponse.json([]);
    }

    // 1. Fetch Regular Bus Bookings
    const { data: regularBookings, error: regularError } = await supabase
      .from('bookings')
      .select('*, buses(*, routes(*))')
      .eq('status', 'Confirmed')
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false });

    if (regularError) {
      console.error("Error fetching regular bookings from Supabase:", regularError);
    }

    // 2. Fetch Town Bus Bookings
    const { data: townBusBookings, error: townBusError } = await supabase
      .from('town_bus_bookings')
      .select('*, town_bus_trips(*)')
      .eq('payment_status', 'Paid')
      .contains('passengers', `[{"phone": "${cleanPhone}"}]`)
      .order('booking_date', { ascending: false });

    if (townBusError) {
      console.error("Error fetching town bus bookings from Supabase:", townBusError);
    }

    let allBookings: any[] = [];

    // Map Regular Bookings to frontend schema
    if (regularBookings) {
      const mappedRegular = regularBookings.map((b: any) => ({
        ...b,
        ticketId: b.ticket_id,
        bookingDate: b.booking_date || b.created_at,
        boardingPoint: b.boarding_point,
        destination: b.destination,
        paymentStatus: b.payment_status || (b.status === "Confirmed" ? "Paid" : "Failed"),
        phonepeTransactionId: b.phonepe_transaction_id || b.transaction_id || "",
        totalAmount: b.total_amount || b.amount,
        busId: b.buses ? { 
          busNumber: b.buses.bus_number, 
          routeId: b.buses.routes ? { routeName: b.buses.routes.name } : null 
        } : { busNumber: "TN-38-REG" }
      }));
      allBookings = [...allBookings, ...mappedRegular];
    }

    // Map Town Bus Bookings to frontend schema
    if (townBusBookings) {
      const { MOCK_BUSES } = await import('@/src/lib/constants');
      const mappedTownBus = townBusBookings.map((b: any) => {
        // Try to resolve bus number: passengers[0].bus_number → MOCK_BUSES lookup by bus_id/trip_id → trip join → fallback
        const mockBus = MOCK_BUSES.find((m: any) => m._id === b.bus_id || m._id === b.trip_id) || null;
        const resolvedBusNumber = b.bus_number || b.passengers?.[0]?.bus_number || mockBus?.busNumber || b.town_bus_trips?.bus_number || 'TOWN-BUS';
        return {
          ...b,
          ticketId: b.ticket_id,
          bookingDate: b.booking_date || b.created_at,
          boardingPoint: b.boarding_point,
          destination: b.destination,
          paymentStatus: b.payment_status,
          phonepeTransactionId: b.phonepe_transaction_id || b.transaction_id || "",
          totalAmount: b.total_amount || b.amount,
          busId: { 
            busNumber: resolvedBusNumber,
            _id: b.town_bus_trips?.id || b.trip_id 
          }
        };
      });
      allBookings = [...allBookings, ...mappedTownBus];
    }

    // Sort combined results by bookingDate descending
    allBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    console.log(`[Supabase Results] Found ${allBookings.length} total matches.`);

    return NextResponse.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings by phone:", error);
    return NextResponse.json([]);
  }
}
