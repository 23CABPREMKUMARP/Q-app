import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase } from '@/src/lib/supabase';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TIpFsYwfq2jYC8',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xOBzZ6o7LERkpGx4a6TVLuhS',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      tripId, 
      seats, 
      totalAmount, 
      boardingPoint, 
      destination, 
      passengers,
      busNumber,
      busCode
    } = body;

    let isSimulationMode = false;
    if (tripId === 'mock-trip-1' || !tripId?.includes('-')) {
      isSimulationMode = true;
    }

    const ticketId = `TB-${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantTransactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: totalAmount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: merchantTransactionId,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ success: false, error: "Failed to create Razorpay order" }, { status: 500 });
    }

    // Create Pending Booking
    // Note: bus_number is embedded in passengers[0].bus_number to avoid schema changes
    const enrichedPassengers = Array.isArray(passengers)
      ? passengers.map((p: any, i: number) => i === 0 ? { ...p, bus_number: busNumber || '', busCode: busCode || '' } : p)
      : passengers;

    const bookingData = {
      ticket_id: ticketId,
      user_id: userId || 'GUEST',
      trip_id: isSimulationMode ? null : tripId,
      seats,
      total_amount: totalAmount,
      boarding_point: boardingPoint,
      destination,
      passengers: enrichedPassengers,
      payment_status: 'Pending',
      status: 'Pending', 
      qr_token: crypto.randomBytes(16).toString('hex'),
      phonepe_transaction_id: order.id, // Store Razorpay order ID here
      payment_gateway: 'Razorpay',
    };

    try {
      const { error } = await supabase.from('town_bus_bookings').insert([bookingData]);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save Pending booking to Supabase", e);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      ticketId, 
      isSimulation: isSimulationMode,
      amount: totalAmount * 100
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
