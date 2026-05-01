const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sleep_predictor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to DB');
  const result = await Product.updateMany(
    { createdAt: { $exists: false } },
    { $set: { createdAt: new Date() } }
  );
  console.log('Update result:', result);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
