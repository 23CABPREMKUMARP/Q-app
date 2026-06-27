import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  try {
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters (from, to)' },
        { status: 400 }
      );
    }

    // Step 1: Fetch routes to find matches
    const { data: allRoutes, error: routesError } = await supabase.from('routes').select('id, name, stops');
    if (routesError || !allRoutes || allRoutes.length === 0) {
        throw new Error("No routes found in DB");
    }

    // We do basic matching here, assuming stops is an array of names or JSON objects
    const matchingRouteIds = allRoutes.filter((route: any) => {
      if (!route.stops) return false;
      const stopsNames = route.stops.map((s: any) => typeof s === 'string' ? s.toLowerCase() : (s.name || s.stopName || "").toLowerCase());
      const fromIdx = stopsNames.findIndex((n: string) => n.includes(from.toLowerCase()));
      const toIdx = stopsNames.findIndex((n: string) => n.includes(to.toLowerCase()));
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    }).map((r: any) => r.id);

    if (matchingRouteIds.length === 0) {
      return NextResponse.json({ trips: [] });
    }

    // Step 2: Find TownBusTrips for those routes
    const { data: trips, error: tripsError } = await supabase
      .from('town_bus_trips')
      .select('*')
      .in('route_id', matchingRouteIds);

    if (tripsError || !trips || trips.length === 0) {
      throw new Error("No trips found in DB, falling back to mock data");
    }

    // Map to frontend expectation
    const formattedTrips = trips.map((trip: any) => ({
      _id: trip.id,
      busId: { 
         busNumber: trip.bus_number, 
         busCode: trip.bus_number, 
         qrCodeUrl: `jeffben://bus/${trip.bus_number}` 
      },
      routeId: { routeName: trip.origin + " to " + trip.destination },
      departureTime: trip.departure_time,
      arrivalTime: trip.arrival_time,
      fare: trip.price,
      availableSeats: trip.available_seats,
      crowdStatus: "Low",
      features: { isAC: false, isSeater: true, isWomenFriendly: true }
    }));

    return NextResponse.json({ trips: formattedTrips });
  } catch (error) {
    console.error('Error fetching town bus trips, returning mock data:', error);
    
    // Mock Data Fallback
    const { MOCK_BUSES } = require('@/src/lib/constants');
    
    const filteredMockTrips = MOCK_BUSES.filter((bus: any) => {
      if (!bus.routeId || !bus.routeId.stops) return false;
      
      const stopsNames = bus.routeId.stops.map((s: any) => {
        if (typeof s === 'string') return s.toLowerCase();
        return (s.name || s.stopName || "").toLowerCase();
      });
      
      const fromIdx = stopsNames.findIndex((n: string) => n.includes(from.toLowerCase()));
      const toIdx = stopsNames.findIndex((n: string) => n.includes(to.toLowerCase()));
      
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });

    if (filteredMockTrips.length === 0) {
      return NextResponse.json({ trips: [] });
    }

    const mockTrips = filteredMockTrips.map((bus: any) => ({
      _id: bus._id,
      busId: { busNumber: bus.busNumber, busCode: bus.busCode, qrCodeUrl: `jeffben://bus/${bus.busCode}` },
      routeId: { routeName: bus.routeId.routeName },
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      fare: bus.fare * 15,
      availableSeats: bus.availableSeats,
      crowdStatus: bus.status === 'Running' ? 'Low' : 'Medium',
      features: { isAC: false, isSeater: true, isWomenFriendly: true }
    }));

    return NextResponse.json({ trips: mockTrips });
  }
}

