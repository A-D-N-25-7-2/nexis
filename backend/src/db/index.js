import mongoose from 'mongoose';
import { DB_name } from '../constants.js';

const connectDB = async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`);
        console.log(`\nConnected to DB successfully, Host: ${mongoose.connection.host}`);

    }
    catch(error){
        console.log('Error connecting to DB: ', error);
        process.exit(1);
    }
}

export default connectDB;