import mongoose from "mongoose";

const { Schema } = mongoose;

const chatSchema = new Schema({
  driverPhone: String,
  lastTime: String,
  messages: Array,
  adminSubscriptionId: String,
  adminSubscription: Object,
});

export default mongoose.model("chat", chatSchema);
