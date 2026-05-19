import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import Bus from '../src/models/Bus';

async function updateFares() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    const result = await Bus.updateMany({}, { $set: { fare: 1 } });
    console.log(`Successfully updated ${result.modifiedCount} buses to fare 1.`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating fares:', error);
    process.exit(1);
  }
}

updateFares();
