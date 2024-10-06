import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  maxParticipants: Number,
  confirmedParticipants: [
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" },
  ],
  waitlistParticipants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" }],
});

const Event = mongoose.model("Event", eventSchema);

export default Event
