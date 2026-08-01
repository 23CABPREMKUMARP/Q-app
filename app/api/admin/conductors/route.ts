import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('conductor_assignments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("GET conductor_assignments Error:", error);
    return NextResponse.json({ error: "Failed to read data", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if email or employee_id already exists
    const { data: existing } = await supabase
      .from('conductor_assignments')
      .select('id')
      .or(`email.eq.${body.email},employee_id.eq.${body.employee_id}`);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: "Email or Employee ID already assigned." }, { status: 400 });
    }

    const newAssignment = {
      id: `cond_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      email: body.email,
      employee_id: body.employee_id,
      assigned_bus: body.assigned_bus || "",
      assigned_route: body.assigned_route || "",
      status: body.status || "Active",
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('conductor_assignments')
      .insert([newAssignment]);

    if (error) throw error;
    
    return NextResponse.json({ success: true, conductor: newAssignment });
  } catch (error: any) {
    console.error("POST conductor_assignments Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add conductor", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('conductor_assignments')
      .update(body)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: "Conductor not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, conductor: data });
  } catch (error: any) {
    console.error("PATCH conductor_assignments Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update conductor", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from('conductor_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE conductor_assignments Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete conductor", details: error.message }, { status: 500 });
  }
}
