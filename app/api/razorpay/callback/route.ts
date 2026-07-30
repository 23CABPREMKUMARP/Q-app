import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/src/lib/supabase';

export async function POST(req: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const url = new URL(req.url);
    const tripId = url.searchParams.get('tripId');
    const ticketId = url.searchParams.get('ticketId');
    
    // Fallback if form data isn't easily parseable
    let razorpay_order_id = '';
    let razorpay_payment_id = '';
    let razorpay_signature = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      razorpay_order_id = formData.get('razorpay_order_id') as string || '';
      razorpay_payment_id = formData.get('razorpay_payment_id') as string || '';
      razorpay_signature = formData.get('razorpay_signature') as string || '';
    } else {
      const body = await req.json().catch(() => ({}));
      razorpay_order_id = body.razorpay_order_id || '';
      razorpay_payment_id = body.razorpay_payment_id || '';
      razorpay_signature = body.razorpay_signature || '';
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'xOBzZ6o7LERkpGx4a6TVLuhS';
    
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      console.error("Signature mismatch in callback", { digest, razorpay_signature });
      if (tripId) {
        return NextResponse.redirect(new URL(`/town-bus/${tripId}/seat-selection?error=verification_failed`, origin), 303);
      }
      return NextResponse.redirect(new URL(`/`, origin), 303);
    }

    // Update DB
    const { data: booking } = await supabase
      .from('town_bus_bookings')
      .select('*')
      .eq('phonepe_transaction_id', razorpay_order_id)
      .single();

    if (booking) {
      await supabase
        .from('town_bus_bookings')
        .update({
          payment_status: 'Completed',
          status: 'Confirmed'
        })
        .eq('id', booking.id);
    } else if (ticketId) {
      // Fallback update
      const { data: booking2 } = await supabase
        .from('town_bus_bookings')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
        
      if (booking2) {
        await supabase
          .from('town_bus_bookings')
          .update({
            payment_status: 'Completed',
            status: 'Confirmed'
          })
          .eq('id', booking2.id);
      }
    }

    // Redirect to success
    if (tripId) {
      return NextResponse.redirect(new URL(`/town-bus/${tripId}/seat-selection?success=true&ticketId=${ticketId}`, origin), 303);
    }
    return NextResponse.redirect(new URL(`/get-ticket`, origin), 303);

  } catch (error) {
    console.error("Error processing Razorpay callback:", error);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL(`/?error=server_error`, origin));
  }
}
