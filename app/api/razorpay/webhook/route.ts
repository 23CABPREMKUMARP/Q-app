import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/src/lib/supabase';

// Razorpay webhook validation requires raw body
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload.order?.entity?.id;

      if (orderId) {
        // Update booking status in Supabase
        const { error } = await supabase
          .from('town_bus_bookings')
          .update({
            payment_status: 'Completed',
            status: 'Confirmed'
          })
          .eq('phonepe_transaction_id', orderId)
          .in('status', ['Pending', 'Failed']); // If it previously failed but now captured, update it

        if (error) {
          console.error("Supabase update error:", error);
          return NextResponse.json({ success: false, error: "Failed to update database" }, { status: 500 });
        }
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const { error } = await supabase
          .from('town_bus_bookings')
          .update({
            payment_status: 'Failed',
            status: 'Failed'
          })
          .eq('phonepe_transaction_id', orderId)
          .eq('status', 'Pending'); // Don't override if already confirmed

        if (error) {
          console.error("Supabase update error:", error);
          return NextResponse.json({ success: false, error: "Failed to update database" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
