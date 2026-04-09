const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//it is like importing lib in java ..
const jobRoutes = require('./routes/jobRoutes');
//we are importing jobroutes file form route folder
const app = express();
//from express package we have called express function which will return a application object (main part )
app.use(cors({
    origin: "*"
}));
//cors is used to allow cross origin resource sharing (it allows us to access our backend api from different domain or port)
app.use(express.json());
//it is used to parse the incoming request body in json format
mongoose.connect('mongodb+srv://GurjitSingh:JeetaS12@smartjob.kmt93ug.mongodb.net/?appName=smartjob')
    //we are connecting to mongodb database using mongoose connect method and we have to provide the connection string of our database
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
//we are using then and catch to handle the promise returned by mongoose connect method
app.use('/jobs', jobRoutes);
//we are using jobroutes for all the routes that start with /job
const authRoutes = require("./routes/authRoutes");

app.use("/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running");
});
//we are starting the server on port 5000 and we have provided a callback function that will be called when the server is started successfully