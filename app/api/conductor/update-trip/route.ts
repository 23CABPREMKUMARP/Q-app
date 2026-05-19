import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Bus from "@/src/models/Bus";
import Booking from "@/src/models/Booking";
import BusLocation from "@/src/models/BusLocation";
import TripNotification from "@/src/models/TripNotification";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { busId, status, speed, lat, lng, customBroadcast } = body;

    if (!busId) {
      return NextResponse.json({ success: false, message: "Missing Bus ID" }, { status: 400 });
    }

    // 1. Fetch and update the Bus status/speed
    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
    }

    if (status) {
      bus.status = status;
    }
    if (speed !== undefined) {
      bus.speed = speed;
    }
    bus.lastUpdate = new Date();
    await bus.save();

    // 2. Insert new location entry if coordinates are provided
    if (lat !== undefined && lng !== undefined) {
      await BusLocation.create({
        busId,
        lat,
        lng,
        timestamp: new Date()
      });
    }

    // 3. Auto-notify booked passengers of that bus
    let notificationSent = false;
    let notificationTitle = "";
    let notificationMessage = "";

    if (customBroadcast) {
      notificationTitle = `Driver Broadcast [JB-${bus.busCode}]`;
      notificationMessage = customBroadcast;
    } else if (status === "Trip Started") {
      notificationTitle = "Your Bus Trip has Started! 🚀";
      notificationMessage = `Bus ${bus.busNumber} has departed. Track its real-time location live on the map!`;
    } else if (status === "Arriving Soon") {
      notificationTitle = "Bus Arriving Soon! 🛑";
      notificationMessage = `Bus ${bus.busNumber} is approaching your boarding terminal. Please be ready to board!`;
    } else if (status === "Reached Stop") {
      notificationTitle = "Bus Reached Nearby Stop 📍";
      notificationMessage = `Bus ${bus.busNumber} has arrived at a checkpoint nearby.`;
    } else if (status === "Completed") {
      notificationTitle = "Trip Completed Successfully 🏁";
      notificationMessage = `Your journey with Digi Bus ${bus.busNumber} has concluded. Thank you for riding with us!`;
    }

    if (notificationTitle && notificationMessage) {
      // Find all bookings with paymentStatus = "Paid" for this bus
      const bookings = await Booking.find({ busId, paymentStatus: "Paid" });
      const notifications = [];

      for (const booking of bookings) {
        if (booking.passengers && booking.passengers.length > 0) {
          for (const passenger of booking.passengers) {
            if (passenger.phone) {
              notifications.push({
                userId: booking.userId,
                phone: passenger.phone,
                busId,
                ticketId: booking.ticketId,
                title: notificationTitle,
                message: notificationMessage,
                status: "Unread",
                createdAt: new Date()
              });
            }
          }
        }
      }

      if (notifications.length > 0) {
        await TripNotification.insertMany(notifications);
        notificationSent = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Trip parameters and telemetry broadcasted successfully",
      status: bus.status,
      speed: bus.speed,
      notificationSent
    });
  } catch (error: any) {
    console.error("Conductor telemetry broadcast failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
