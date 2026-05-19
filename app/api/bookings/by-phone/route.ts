import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Booking from "@/src/models/Booking";
import Bus from "@/src/models/Bus";
import Route from "@/src/models/Route";
import { supabaseFetch } from "@/src/lib/supabase";

export async function POST(req: Request) {
  try {
    // Matrix Hub Resilience: Try to connect to DB, but allow simulation mode survival
    try {
       await connectDB();
    } catch (dbError) {
       console.warn("Matrix Hub Link Offline: Shifting to Cloud Matrix Fallback.");
       // DO NOT return here - we need to continue to Supabase check
    }
    const body = await req.json().catch(() => ({}));
    const phone = body.phone;

    if (!phone) {
       console.log("[Search Failure] Phone number missing in payload.");
       return NextResponse.json([]);
    }

    console.log(`[Matrix Search] Initiated for: ${phone}`);

    let bookings: any[] = [];
    
    // Attempt MongoDB Retrieval if possible
    try {
      bookings = await Booking.find({
        "passengers.phone": phone,
        paymentStatus: "Paid"
      })
      .populate({
        path: "busId",
        populate: { path: "routeId" }
      })
      .sort({ bookingDate: -1 });
      console.log(`[MongoDB Results] Found ${bookings.length} matches.`);
    } catch (mongoError) {
      console.warn("MongoDB Neural Cluster Unreachable: Checking Cloud Matrix Only.");
    }

    // SUPABASE FALLBACK / SYNC: If MongoDB is silent or in simulation, check Supabase Matrix
    if (bookings.length === 0) {
      try {
        const cleanPhone = phone.trim();
        console.log(`[Supabase Search] Checking Matrix for: ${cleanPhone}`);
        // Explicitly selecting all columns to ensure full data hydration
        const supabaseResults = await supabaseFetch("bookings", "GET", undefined, `select=*&phone=eq.${encodeURIComponent(cleanPhone)}`);
        console.log(`[Supabase Result] Raw Data:`, JSON.stringify(supabaseResults));
        console.log(`[Supabase Results] Found ${supabaseResults?.length || 0} matches.`);
        if (supabaseResults && supabaseResults.length > 0) {
          // Map Supabase layout to the expected Frontend schema
          const mappedResults = supabaseResults.map((b: any) => ({
             ...b,
             ticketId: b.ticket_id,
             bookingDate: b.created_at || new Date().toISOString(),
             boardingPoint: b.boarding_point,
             destination: b.destination,
             seats: b.seats || ["S-1"],
             // Note: In a full migration, we'd also fetch Bus details from Supabase
             busId: { busNumber: "SB-FLEET", departureTime: "LIVE" } 
          }));
          return NextResponse.json(mappedResults);
        }
      } catch (sbError) {
        console.warn("Supabase Retrieval Link Offline:", sbError);
      }
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings by phone:", error);
    // Absolute fallback: Return empty list to prevent frontend crash
    return NextResponse.json([]);
  }
}
