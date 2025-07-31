// models/Cleaner.js
import mongoose from 'mongoose';
import scheduleSchema from './Schedule.js'; // assuming it's in its own file

const cleanerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  age: {
  type: Number,
  required: true,
  min: [18, 'Minimum age is 18'],
  max: [80, 'Maximum age is 80']
  },
  hourlyPrice: { type: Number, required: true },
  stars: { type: Number, default: 0 },
  comments: [{ type: String }],
  service: [{type: String, required: true}],
  role: {type: String, default: "cleaner"}
});

export default mongoose.model('Cleaner', cleanerSchema);
