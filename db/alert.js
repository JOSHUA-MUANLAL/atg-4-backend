const connection=require('./db')
const mongoose=require('mongoose');

try{
    const Alertdata=new mongoose.Schema({
        user_email:String,
        coinid:String,
        
        target:Number
       });

       const AlertData=connection.model('alerts',Alertdata)
       console.log("connect alert schema", AlertData)

       module.exports={AlertData}



}catch(error){
    console.log(error)
}