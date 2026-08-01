import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: "Email parameter is required" }, { status: 400 });
    }

    const { data: assignment, error } = await supabase
      .from('conductor_assignments')
      .select('*')
      .ilike('email', email)
      .eq('status', 'Active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw error;
    }

    if (assignment) {
      return NextResponse.json({ success: true, isAssigned: true, assignment });
    } else {
      return NextResponse.json({ success: true, isAssigned: false });
    }
  } catch (error: any) {
    console.error("GET check-assignment Error:", error);
    return NextResponse.json({ success: false, error: "Failed to check assignment", details: error.message }, { status: 500 });
  }
}
