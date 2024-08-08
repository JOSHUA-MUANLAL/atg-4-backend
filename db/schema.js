const connection=require('./db')
const mongoose = require('mongoose');

try{
    const Userdata = new mongoose.Schema({
       user_email:String,
       user_name:String,
       password:String,
       user_number:Number,
       resetotp: String,
       resettime: Date,
       address:String,
       
      
      });
      
      
      // Create the User model
      const UserData = connection.model('userdetails', Userdata);
      console.log("connected",UserData);
      
      // Export the User model
      module.exports = {UserData};

}catch(error){
    console.log("Error in Usermodel:-\n",error)
}