require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sleep_predictor')
.then(async () => {
  await Product.deleteMany({});
  await Product.insertMany([
    { name: 'Ergonomic Memory Foam Pillow', price: 45.99, image: 'https://images.unsplash.com/photo-1584100936595-c0654b355040?w=500&q=80', description: 'Neck support pillow for deep sleep. Relieves tension and aligns spine.', category: 'pillows' },
    { name: 'Weighted Sleep Mask', price: 24.99, image: 'https://images.unsplash.com/photo-1541818293796-03c0ddff23cd?w=500&q=80', description: 'Blocks 100% of light, applies gentle pressure for deep relaxation.', category: 'masks' },
    { name: 'Blue Light Blocking Glasses', price: 35.00, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80', description: 'Reduces eye strain from screens before bed. Essential for digital workers.', category: 'glasses' },
    { name: 'Magnesium Sleep Supplement', price: 19.99, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', description: 'Natural relaxation supplement to calm the nervous system.', category: 'supplements' }
  ]);
  console.log('Products Seeded!');
  process.exit();
});
