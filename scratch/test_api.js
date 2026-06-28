async function run() {
  const trip = { _id: "bus_tnb1001" };
  console.log("Trip ID:", trip._id);
  console.log("Seat Selection URL:", `/town-bus/${trip._id}/seat-selection`);
}
run();
