import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/src/lib/supabase';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ticketId } = await req.json();

    const secret = 'xOBzZ6o7LERkpGx4a6TVLuhS';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Transaction not legit!" }, { status: 400 });
    }

    // Payment is successful, update DB
    // we saved razorpay_order_id in phonepe_transaction_id
    const { data: booking, error: fetchError } = await supabase
      .from('town_bus_bookings')
      .select('*')
      .eq('phonepe_transaction_id', razorpay_order_id)
      .single();

    if (fetchError || !booking) {
      // try ticketId fallback
      const { data: booking2, error: err2 } = await supabase
        .from('town_bus_bookings')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
      if (!err2 && booking2) {
        await supabase
          .from('town_bus_bookings')
          .update({
            payment_status: 'Completed',
            status: 'Confirmed'
          })
          .eq('id', booking2.id);
        return NextResponse.json({ success: true, message: "Payment verified successfully" });
      }
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('town_bus_bookings')
      .update({
        payment_status: 'Completed',
        status: 'Confirmed'
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ success: false, error: "Failed to update booking status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
