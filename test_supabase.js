const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://naijinoigiogdfpecbmp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haWppbm9pZ2lvZ2RmcGVjYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDcyOTcsImV4cCI6MjA5MTcyMzI5N30.ugmZKmXlJ_VPyI8nr04Y6EgE5qlnDoH9jrKZVQq3hQ0');
async function test() {
  const { data, error } = await supabase.from('town_bus_bookings').insert([{
      ticket_id: 'TEST-1234',
      user_id: 'GUEST',
      seats: ['S-1'],
      total_amount: 10,
      payment_status: 'Pending',
      status: 'Pending', 
      payment_gateway: 'Razorpay',
      boarding_point: '',
      destination: '',
      passengers: []
  }]);
  console.log(error);
}
test();
