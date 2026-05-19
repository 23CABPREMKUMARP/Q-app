import mongoose from "mongoose";

const TripNotificationSchema = new mongoose.Schema({
  userId: { type: String },
  phone: { type: String, required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
  ticketId: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["Unread", "Read"], default: "Unread" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TripNotification || mongoose.model("TripNotification", TripNotificationSchema);
