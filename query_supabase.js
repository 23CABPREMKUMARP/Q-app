const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://naijinoigiogdfpecbmp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haWppbm9pZ2lvZ2RmcGVjYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDcyOTcsImV4cCI6MjA5MTcyMzI5N30.ugmZKmXlJ_VPyI8nr04Y6EgE5qlnDoH9jrKZVQq3hQ0');
async function query() {
  const { data, error } = await supabase.from('town_bus_bookings').select('*').order('booking_date', { ascending: false }).limit(2);
  console.log(JSON.stringify(data, null, 2));
}
query();
