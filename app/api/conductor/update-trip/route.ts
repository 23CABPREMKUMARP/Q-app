import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { busId, status, speed, lat, lng, customBroadcast } = body;

    if (!busId) {
      return NextResponse.json({ success: false, message: "Missing Bus ID" }, { status: 400 });
    }

    // 1. Fetch and update the Bus status/speed
    const { data: bus, error: fetchError } = await supabase
      .from('buses')
      .select('*')
      .eq('id', busId)
      .single();

    if (fetchError || !bus) {
      return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
    }

    const updates: any = { };
    if (status) updates.status = status;
    if (speed !== undefined) updates.speed = speed;
    if (lat !== undefined && lng !== undefined) {
      updates.location = { lat, lng };
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('buses').update(updates).eq('id', busId);
    }

    // 2. Auto-notify booked passengers of that bus
    let notificationSent = false;
    let notificationTitle = "";
    let notificationMessage = "";

    if (customBroadcast) {
      notificationTitle = `Driver Broadcast [JB-${bus.bus_code || bus.bus_number}]`;
      notificationMessage = customBroadcast;
    } else if (status === "Trip Started") {
      notificationTitle = "Your Bus Trip has Started! 🚀";
      notificationMessage = `Bus ${bus.bus_number} has departed. Track its real-time location live on the map!`;
    } else if (status === "Arriving Soon") {
      notificationTitle = "Bus Arriving Soon! 🛑";
      notificationMessage = `Bus ${bus.bus_number} is approaching your boarding terminal. Please be ready to board!`;
    } else if (status === "Reached Stop") {
      notificationTitle = "Bus Reached Nearby Stop 📍";
      notificationMessage = `Bus ${bus.bus_number} has arrived at a checkpoint nearby.`;
    } else if (status === "Completed") {
      notificationTitle = "Trip Completed Successfully 🏁";
      notificationMessage = `Your journey with Smart Thamizha ${bus.bus_number} has concluded. Thank you for riding with us!`;
    }

    if (notificationTitle && notificationMessage) {
      // Find all bookings with paymentStatus = "Paid" for this bus
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('bus_id', busId)
        .eq('payment_status', 'Paid');

      const notifications = [];

      if (bookings) {
        for (const booking of bookings) {
          if (booking.passengers && booking.passengers.length > 0) {
            for (const passenger of booking.passengers) {
              if (passenger.phone) {
                notifications.push({
                  user_id: booking.user_id,
                  phone: passenger.phone,
                  title: notificationTitle,
                  message: notificationMessage,
                  status: "Unread"
                });
              }
            }
          }
        }
      }

      if (notifications.length > 0) {
         // Assuming a notifications table exists in Supabase
         await supabase.from('notifications').insert(notifications);
         notificationSent = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Trip parameters and telemetry broadcasted successfully",
      status: status || bus.status,
      speed: speed || bus.speed,
      notificationSent
    });

  } catch (error) {
    console.error("Trip Update Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
