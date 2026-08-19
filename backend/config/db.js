import mongoose from "mongoose";

export async function connectDB(){

    try{

        await mongoose.connect(process.env.MONGO_URI);

    console.log("connected the database");

    }catch(e){

        console.error("MongoDB connection failed:", e.message);

        process.exit(1);

       


    }
}