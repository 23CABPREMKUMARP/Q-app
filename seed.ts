import mongoose from 'mongoose';
import Bus from './src/models/Bus';
import Route from './src/models/Route';
import Stop from './src/models/Stop';
import BusLocation from './src/models/BusLocation';
import Seat from './src/models/Seat';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bus-booking";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Stop.deleteMany({}),
    BusLocation.deleteMany({}),
    Seat.deleteMany({}),
  ]);

  // Create Stops
  const stops = await Stop.create([
    { stopName: "Gandhipuram", lat: 10.9996, lng: 76.9702 },
    { stopName: "Thudiyalur", lat: 11.0500, lng: 76.9600 },
    { stopName: "Mettupalayam", lat: 11.3000, lng: 76.9366 },
    { stopName: "Ukkadam", lat: 10.9940, lng: 76.9548 },
    { stopName: "Kinathukadavu", lat: 10.8500, lng: 76.9800 },
    { stopName: "Pollachi", lat: 10.6620, lng: 77.0060 },
    { stopName: "Coimbatore Junction", lat: 11.0168, lng: 76.9558 },
    { stopName: "SITRA", lat: 11.0300, lng: 77.0400 },
    { stopName: "Avinashi", lat: 11.1930, lng: 77.2680 },
    { stopName: "Singanallur", lat: 11.0000, lng: 77.0300 },
    { stopName: "Sulur", lat: 11.0200, lng: 77.1200 },
    { stopName: "Palladam", lat: 11.0000, lng: 77.2880 },
    { stopName: "Saravanampatti", lat: 11.0700, lng: 77.0000 },
    { stopName: "Kovilpalayam", lat: 11.1500, lng: 77.0500 },
    { stopName: "Annur", lat: 11.2330, lng: 77.1000 },
  ]);

  // Create Routes
  const r1 = await Route.create({
    routeName: "Coimbatore → Mettupalayam",
    from: "Gandhipuram",
    to: "Mettupalayam",
    path: [
      { lat: 10.9996, lng: 76.9702 },
      { lat: 11.0500, lng: 76.9600 },
      { lat: 11.1500, lng: 76.9500 },
      { lat: 11.2500, lng: 76.9400 },
      { lat: 11.3000, lng: 76.9366 },
    ],
    stops: [stops[0]._id, stops[1]._id, stops[2]._id],
  });

  const r2 = await Route.create({
    routeName: "Coimbatore → Pollachi",
    from: "Ukkadam",
    to: "Pollachi",
    path: [
      { lat: 10.9940, lng: 76.9548 },
      { lat: 10.8500, lng: 76.9800 },
      { lat: 10.6620, lng: 77.0060 },
    ],
    stops: [stops[3]._id, stops[4]._id, stops[5]._id],
  });

  const r3 = await Route.create({
    routeName: "Coimbatore → Avinashi",
    from: "Coimbatore",
    to: "Avinashi",
    path: [
      { lat: 11.0168, lng: 76.9558 },
      { lat: 11.0300, lng: 77.0400 },
      { lat: 11.1000, lng: 77.1500 },
      { lat: 11.1930, lng: 77.2680 },
    ],
    stops: [stops[6]._id, stops[7]._id, stops[8]._id],
  });

  const r4 = await Route.create({
    routeName: "Coimbatore → Palladam",
    from: "Coimbatore",
    to: "Palladam",
    path: [
      { lat: 11.0168, lng: 76.9558 },
      { lat: 11.0000, lng: 77.0300 },
      { lat: 11.0200, lng: 77.1200 },
      { lat: 11.0000, lng: 77.2880 },
    ],
    stops: [stops[6]._id, stops[9]._id, stops[10]._id, stops[11]._id],
  });

  const r5 = await Route.create({
    routeName: "Coimbatore → Annur",
    from: "Coimbatore",
    to: "Annur",
    path: [
      { lat: 11.0168, lng: 76.9558 },
      { lat: 11.0700, lng: 77.0000 },
      { lat: 11.1500, lng: 77.0500 },
      { lat: 11.2330, lng: 77.1000 },
    ],
    stops: [stops[6]._id, stops[12]._id, stops[13]._id, stops[14]._id],
  });

  // Create Buses
  const buses = await Bus.create([
    {
      busNumber: "TN-38-EF-2025",
      busCode: "1024",
      driverName: "Senthil Kumar",
      routeId: r1._id,
      status: "Running",
      speed: 45,
      fare: 1,
      totalSeats: 40,
      availableSeats: 35,
      departureTime: "08:00 AM",
      arrivalTime: "09:30 AM",
    },
    {
      busNumber: "TN-38-XY-9999",
      busCode: "9999",
      driverName: "Rajesh",
      routeId: r2._id,
      status: "Boarding",
      speed: 0,
      fare: 1,
      totalSeats: 40,
      availableSeats: 22,
      departureTime: "09:30 AM",
      arrivalTime: "11:30 AM",
    },
    {
      busNumber: "TN-38-AM-1111",
      busCode: "1111",
      driverName: "Mani",
      routeId: r3._id,
      status: "Running",
      speed: 55,
      fare: 1,
      totalSeats: 40,
      availableSeats: 18,
      departureTime: "07:30 AM",
      arrivalTime: "09:00 AM",
    },
    {
      busNumber: "TN-38-PL-4444",
      busCode: "4444",
      driverName: "Karthik",
      routeId: r4._id,
      status: "Running",
      speed: 48,
      fare: 1,
      totalSeats: 40,
      availableSeats: 40,
      departureTime: "10:00 AM",
      arrivalTime: "11:30 AM",
    },
    {
      busNumber: "TN-38-AR-5555",
      busCode: "5555",
      driverName: "Velu",
      routeId: r5._id,
      status: "Boarding",
      speed: 0,
      fare: 1,
      totalSeats: 40,
      availableSeats: 30,
      departureTime: "11:00 AM",
      arrivalTime: "12:30 PM",
    }
  ]);

  // Create Seats for each bus
  for (const bus of buses) {
    const seatsList = [];
    for (let i = 1; i <= 40; i++) {
        seatsList.push({
            busId: bus._id,
            seatNumber: i.toString(),
            isBooked: Math.random() < 0.2
        });
    }
    await Seat.insertMany(seatsList);
  }

  console.log('Seed completed successfully for Coimbatore region');
  await mongoose.disconnect();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
