import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  busCode: { type: String, unique: true, required: true },
  driverName: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
  status: { type: String, enum: ["Running", "Stopped", "Reached"], default: "Stopped" },
  speed: { type: Number, default: 0 },
  fare: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  qrCodeUrl: { type: String }, // For bus identifier QR
  lastUpdate: { type: Date, default: Date.now },
});


export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);
