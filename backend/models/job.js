const mongoose =require('mongoose');
const jobschema=new mongoose.Schema({
    company :String,
    role:String,
    status:{
        type:String,
        enum:['Applied','Interview','rejected'],
        default:'Applied'
    },
    notes:String
});
//we are creating a schema for our job model using mongoose schema method and we have defined the fields for our job model and we have also defined the enum for status field and we have set the default value for status field to 'Applied' and finally we are exporting the job model using mongoose model method
module.exports=mongoose.model('job',jobschema);
//we are creating a schema for our job model using mongoose schema method and we have defined the fields for our job model and we have also defined the enum for status field and we have set the default value for status field to 'Applied' and finally we are exporting the job model using mongoose model method