import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transactionId');
    const ticketId = url.searchParams.get('ticketId');

    if (!transactionId && !ticketId) {
      return NextResponse.json({ success: false, error: "Missing transactionId or ticketId" }, { status: 400 });
    }

    // 1. Check database first to see if S2S webhook already resolved it
    let query = supabase.from('town_bus_bookings').select('*');
    if (transactionId) {
      query = query.eq('phonepe_transaction_id', transactionId);
    } else {
      query = query.eq('ticket_id', ticketId!);
    }
    const { data: booking, error: fetchError } = await query.single();

    if (fetchError || !booking) {
      // Booking not in DB yet (may be timing issue or old failed insert)
      // Return PENDING so frontend keeps retrying rather than crashing
      return NextResponse.json({ success: false, status: 'PENDING', error: "Booking not found yet" });
    }

    if (booking.payment_status === 'Paid' || booking.payment_status === 'Completed') {
      return NextResponse.json({ success: true, status: 'SUCCESS', booking });
    } else if (booking.payment_status === 'Failed' || booking.payment_status === 'Cancelled') {
      return NextResponse.json({ success: true, status: 'FAILED', booking });
    }

    // 2. Fetch PhonePe V2 Status API
    const clientId = process.env.PHONEPE_CLIENT_ID || 'M228KB3D6IJHS_2606140644';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || 'ZjhlM2ViNDQtZTVkYS00ZDQ5LWJlZmYtNTIxNDNlYzQ5ZmNm';
    const merchantId = clientId.split('_')[0];
    
    const tokenHost = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
    const statusHost = `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${transactionId}/status`;

    // Generate Auth Token
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_version', '1');
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    const tokenRes = await fetch(tokenHost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Token generation failed:", tokenData);
      return NextResponse.json({ success: false, error: "Failed to authenticate with PhonePe" }, { status: 500 });
    }
    const token = tokenData.access_token;

    // Fetch Status
    const statusRes = await fetch(statusHost, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    });

    const statusData = await statusRes.json();
    console.log("PhonePe Status API Response:", JSON.stringify(statusData));

    // Per PhonePe V2 docs: state = COMPLETED | FAILED | PENDING
    let finalStatus = 'PENDING';
    if (statusData.state === 'COMPLETED') {
      finalStatus = 'SUCCESS';
    } else if (statusData.state === 'FAILED' || statusData.state === 'CANCELLED') {
      finalStatus = 'FAILED';
    }
    // If state is still PENDING, keep polling

    // 3. Update Database based on final Status
    // Use the booking's actual transaction ID (resolved from DB if ticketId was used)
    const resolvedTransactionId = transactionId || booking.phonepe_transaction_id;
    
    if (finalStatus === 'SUCCESS') {
      await supabase
        .from('town_bus_bookings')
        .update({ payment_status: 'Paid', status: 'Confirmed' })
        .eq('phonepe_transaction_id', resolvedTransactionId);

      // Re-fetch the updated booking to return fresh data
      const { data: updatedBooking } = await supabase
        .from('town_bus_bookings')
        .select('*')
        .eq('phonepe_transaction_id', resolvedTransactionId)
        .single();

      if (booking.seats && booking.trip_id) {
        for (const seat of booking.seats) {
          await supabase
            .from('town_bus_seats')
            .update({ status: 'Booked', locked_until: null })
            .eq('trip_id', booking.trip_id)
            .eq('seat_number', seat);
        }
      }

      return NextResponse.json({ success: true, status: 'SUCCESS', booking: updatedBooking || booking, phonepeResponse: statusData });

    } else if (finalStatus === 'FAILED') {
      await supabase
        .from('town_bus_bookings')
        .update({ payment_status: 'Failed', status: 'Cancelled' })
        .eq('phonepe_transaction_id', resolvedTransactionId);

      if (booking.seats && booking.trip_id) {
        for (const seat of booking.seats) {
          await supabase
            .from('town_bus_seats')
            .update({ status: 'Available', locked_until: null })
            .eq('trip_id', booking.trip_id)
            .eq('seat_number', seat);
        }
      }
    }

    // For PENDING or FAILED, always include the booking so frontend has boarding/destination
    return NextResponse.json({ success: true, status: finalStatus, booking, phonepeResponse: statusData });

  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
