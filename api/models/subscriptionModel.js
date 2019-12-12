import mongoose from "mongoose";

const { Schema } = mongoose;

const subSchema = new Schema({
  email: String,
  adminSubscription: String,
  aSub: Object,
});

export default mongoose.model("subscription", subSchema);
