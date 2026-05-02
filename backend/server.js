require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
//it is like importing lib in java ..
const jobRoutes =require('./routes/jobRoutes');
//we are importing jobroutes file form route folder
const app=express();
//from express package we have called express function which will return a application object (main part )
app.use(cors());
//cors is used to allow cross origin resource sharing (it allows us to access our backend api from different domain or port)
app.use(express.json());
//it is used to parse the incoming request body in json format
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartjob')
//we are connecting to mongodb database using mongoose connect method and we have to provide the connection string of our database
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.error('Error connecting to MongoDB:', err));
//we are using then and catch to handle the promise returned by mongoose connect method
app.use('/jobs',jobRoutes);
//we are using jobroutes for all the routes that start with /job
app.listen(5000,()=>{
    console.log('Server is running on port 5000');
});
//we are starting the server on port 5000 and we have provided a callback function that will be called when the server is started successfully