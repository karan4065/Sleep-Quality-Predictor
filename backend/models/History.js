const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  age: Number,
  gender: String,
  occupation: String,
  sleep_duration: Number,
  physical_activity: Number,
  stress_level: Number,
  bmi_category: String,
  heart_rate: Number,
  daily_steps: Number,
  blood_pressure: String,
  score: Number,
  category: String,
  suggestions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', historySchema);
