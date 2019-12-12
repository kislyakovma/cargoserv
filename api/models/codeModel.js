import mongoose from "mongoose";

const { Schema } = mongoose;

const codeSchema = new Schema({
  phone: String,
  value: String,
  date: Date,
  smsId: String,
});

export default mongoose.model("code", codeSchema);
