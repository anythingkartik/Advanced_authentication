import mongoose from "mongoose";

// Connection to MongoDB
//.then and .catch are used to handle the promise returned by mongoose.connect, if the promise is resolved then the connection is successful and if the promise is rejected then the connection is unsuccessful
//MONGO_URI is in env file, we got by running the mongosh command in terminal and pasted the connection string in the env file
export const connection=()=>{
    mongoose.
    connect(process.env.MONGO_URI,{
        dbName: "MERN_AUTHENTICATION",
    })
    .then(()=>{
        console.log("Connected to Database")
    })
    .catch((err)=>{
        console.log(`Some error occured while connecting to DB , ${err}`)
    })
};