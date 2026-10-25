const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agricloud_ml';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.log(`[Database] Standalone MongoDB is not active (${error.message}).`);
    console.log('[Database] Seamlessly operating with local persistent store (backend/data/local_db.json).');
  }
};

module.exports = connectDB;
