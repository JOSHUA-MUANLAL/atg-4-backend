const mongoose=require('mongoose')

const connection=mongoose.createConnection('mongodb+srv://mosesml8662:5EY8DpoVBYOApXTy@userdata.q4q0s0u.mongodb.net/?retryWrites=true&w=majority&appName=userdata',{ useNewUrlParser: true, useUnifiedTopology: true ,serverSelectionTimeoutMS: 10000,});

connection.on('connected', () => {
    console.log('MongoDB connection established successfully');
  });
  
  connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });

module.exports=connection