const nodemailer = require("nodemailer");


const transporter=nodemailer.createTransport({
    service:"gmail",
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth:{
        user:'joshua00521202021@msijanakpuri.com',
        pass:'oufq ttzs muvy nwkd',
    },
    debug:true
});





const sendMail=async(mailOptions)=>{
    try{
        await transporter.sendMail(mailOptions)
        console.log("email sent")
    }catch(error){
        console.log(error)
    }
}



module.exports=sendMail