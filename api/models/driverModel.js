import mongoose from "mongoose";

const { Schema } = mongoose;

const driverSchema = new Schema({
  name: String,
  phone: String,
  pushTokens: Array,
});

export default mongoose.model("driver", driverSchema);
