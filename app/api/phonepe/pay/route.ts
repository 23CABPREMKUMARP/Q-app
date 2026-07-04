import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/src/lib/supabase';

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000';
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
    if (tripId === 'mock-trip-1' || !tripId.includes('-')) {
      isSimulationMode = true;
    }

    const ticketId = `TB-${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantTransactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
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
      phonepe_transaction_id: merchantTransactionId,
      payment_gateway: 'PhonePe_V2',
    };

    try {
      const { error } = await supabase.from('town_bus_bookings').insert([bookingData]);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save Pending booking to Supabase", e);
    }

    // PhonePe V2 Configuration
    const clientId = process.env.PHONEPE_CLIENT_ID || 'M228KB3D6IJHS_2606140644';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || 'ZjhlM2ViNDQtZTVkYS00ZDQ5LWJlZmYtNTIxNDNlYzQ5ZmNm';
    const merchantId = clientId.split('_')[0]; // Typically 'M228KB3D6IJHS'
    
    const tokenHost = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
    const checkoutHost = "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

    // 1. Generate Auth Token
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
      return NextResponse.json({ success: false, error: "Failed to generate payment gateway token" }, { status: 400 });
    }
    const token = tokenData.access_token;

    // 2. Create Payment Request
    const payload = {
      merchantId: merchantId,
      merchantOrderId: merchantTransactionId,
      amount: totalAmount * 100, // in paise
      paymentFlow: {
          type: "PG_CHECKOUT",
          message: "Town Bus Ticket Booking",
          merchantUrls: {
              redirectUrl: `${origin}/api/phonepe/callback?tripId=${tripId}&ticketId=${ticketId}`,
              callbackUrl: `${origin}/api/phonepe/callback`
          }
      }
    };

    const payRes = await fetch(checkoutHost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await payRes.json();

    if (responseData.redirectUrl) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: responseData.redirectUrl, 
        transactionId: merchantTransactionId, 
        ticketId, 
        isSimulation: isSimulationMode 
      });
    } else {
      console.error("PhonePe V2 API Error:", responseData);
      return NextResponse.json({ success: false, error: responseData.message || "Payment initiation failed" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error initiating PhonePe V2 payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
