const bodyParser = require('body-parser')
const express=require('express')
const app=express()
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const authentication=require('./middleware/authentication')
const cors=require('cors')
const secretKey = 'joshua';
const bcrypt=require('bcryptjs')
const {UserData}=require('./db/schema')
const {AlertData}=require('./db/alert')
const axios=require('axios')

app.use(bodyParser.json())
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const sendmail=require('./db/sendmail')

const NodeCache = require('node-cache');
const http = require('http');
const socketIo = require('socket.io');


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true, // Allows the browser to send cookies and other headers
    },
    allowEIO3: true // Ensures compatibility with some older versions of Socket.IO clients
  });
const cache = new NodeCache();






app.post('/userregister',async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const name=req.body.name
        const number=req.body.number;
        const address=req.body.address;

        console.log(password)
        
        let check=await UserData.findOne({user_email:email})

        if(check){
            res.status(404).json({message:"User Already Existed"})

        }else{
            const saltRounds=10;
            const hashedPassword=await bcrypt.hash(password, saltRounds)

            const user=new UserData({
                user_email:email,
                user_eame: name,
                user_number:number,
                password:hashedPassword,
                address:address
            
            })

            console.log("User data inserted")
            
            user.save()
            .then(result=>{
                console.log("user data saved")
                let mailOptions={
                    from:{
                        name:'Joshua',
                        address:'joshua00521202021@msijanakpuri.com'
                    },
                    to:email,
                    subject:'Registration Complete',
                    text:'Registration Complete',
                    html:`<b>Welcome! User ${name}<br> Thank you For Registering With Us<br></b>`
                          }
                  sendmail(mailOptions)
                res.status(200).json({message:'user Registered, Check for a mail'})
            })
            .catch(error=>{
                console.log(error)
                res.status(404).json({message:error})
            })
        }


    }catch(error){
        console.log(error)
        res.status(404).json({error})
    }
})

app.post("/forgotpassword",async(req,res)=>{
    try{
        const email=req.body.email;

        const check=await UserData.findOne({user_email:email})

        if(!check){
            res.status(404).json({message:"No Such User Exist"})
        }
        const otp=Math.floor(Math.random() * 900000) + 100000;

        check.resetotp=otp;
        check.resettime=Date.now() + 3600000;
        await check.save()

        let mailOptions={
            from:{
                name:'Joshua',
                address:'joshua00521202021@msijanakpuri.com'
            },
            to:email,
            subject:'One Time Password',
            text:'Passsword OTP',
            html:`<b>Dear User ${email}<br> Your OTP for Password reset is<ul> ${otp}</ul> </b>`
                  }
            sendmail(mailOptions)
            res.status(202).json({message:`your otp for password reset has been send to your registered email`})




    }catch(error){
        console.log(error)
        res.status(404).json({error})
    }
})

app.post('/resetpassword',async(req,res)=>{
    try{
        const email=req.body.email;
        const otp=req.body.otp;
        const newpassword=req.body.newpassword;

        result=await UserData.findOne({user_email:email})
       

        if(result){
            console.log(result,"1")
            if(result.resetotp==otp){
                const saltRounds=10;
                const hashedPassword=await bcrypt.hash(newpassword, saltRounds);
                console.log("hashed",hashedPassword)

                result.password=hashedPassword;
                result.resetotp=undefined;
                
                await result.save()

                let mailOptions={
                    from:{
                        name:'Joshua',
                        address:'joshua00521202021@msijanakpuri.com'
                    },
                    to:email,
                    subject:'Password reset',
                    text:'Reset password',
                    html:`<b>Dear User ${email}<br> Your password has been reset successfully </b>`
                          }
                    sendmail(mailOptions)



            }else{
                res.status(400).json({message:"OTP IS INCORRECT"})
            }
            res.status(202).json({message:"Password reset successfully"})
        }else{
            res.status(404).json({message:"NO USER FOUND"})
        }

    }catch(error){
        console.log("here")
        console.log(error)
        res.status(404).json({error:error})

    }
})

app.post("/login",async(req,res)=>{
    try{

        const email=req.body.email;
        const password=req.body.password;
       

        let result=await UserData.findOne({user_email:email})
        
        if(result){
            console.log("user found")
            
        let passwordcompare=await bcrypt.compare(password,result.password)

        if(passwordcompare){
            

            const userPayload={
                id: result._id,
                name:result.user_name,
                email:result.user_email
            }
            
            const token = jwt.sign(userPayload, secretKey);
            console.log("3)Token signed");
            
            res.status(200).json({token})

        }else{
            console.log("password incorrect")
            res.status(401).json({message:"Password incorrect"})
            
        }
        
        }else{console.log('user not found')
            res.status(401).json({message:'User Not Found'})
        }


    }catch(error){
        console.log(error)
        res.status(404).json({error})
    }
})

app.get('/getuserdata',authentication,async(req,res)=>{
    try{
        let email=req.userdetail.email;

        const result=await UserData.findOne({user_email:email})

        if(!result){
            res.status(404).json({message:"failed to get data"})
        }
        console.log("GOT USER DETAIL")

        res.status(202).json(result)


    }catch(error){
        res.status(404).json({message:error})
    }
})



io.on('connection', (socket) => {
    try{
        let a=1;
    console.log('Client connected',socket.id);
  
    const options = {
        method: 'GET',
        url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd',
        headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-ZWBTZ8bBrdtfTWSPGC99mkFx'}
      };
      
      axios
        .request(options)
        .then(function (response) {
            const oldPrices = cache.get('prices') ||  {};
            cache.set('prices',response.data)
            socket.emit('coinprices', response.data,oldPrices,a);
        })
        .catch(function (error) {
          console.error(error);
        });
    
    // Fetch and broadcast prices periodically
    setInterval(async () => {
        
      try {
        const opt = {
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd',
            headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-ZWBTZ8bBrdtfTWSPGC99mkFx'}
          };

          const response=await axios.request(opt)
        let prices = response.data;
        console.log("new price",prices[0])
        let oldprice=cache.get('prices')
        console.log('old price',oldprice[0])
        cache.set('prices', prices);
      console.log("fecth new price")  

      a=a+1;
       
        

        socket.emit('coinprices', prices,oldprice,a);
      } catch (error) {
        console.error('Failed to fetch prices', error);
      }
    }, 2000);
    }catch(error){
        console.log(error)
    }
 // Fetch prices every minute
  });

  
  





// Alerting System
app.post('/setalert',authentication, async (req, res) => {
    try { 
        

        const email=req.userdetail.email;
        const newAlert=req.body.id;
        const target=req.body.target
       console.log("new alert",newAlert)

      
        
        const result=await AlertData.findOne({coinid:newAlert,user_email:email})

        if(result){
            result.target=target;
            await result.save()
            console.log("alert update")
            let mailOptions={
                from:{
                    name:'Joshua',
                    address:'joshua00521202021@msijanakpuri.com'
                },
                to:req.userdetail.email,
                subject:'Alert',
                text:`Alert Regarding coin ${newAlert} ` ,
                html:`dear user ${email} a new Alert target of ${target} of coin ${newAlert}  have been added`
                      }
                sendmail(mailOptions)
            res.json({message:"set alert"})
        }else{
            const alert = new AlertData({
                coinid: newAlert,
                user_email: email,
                target: target
            });

            console.log("alert set",email)

            await alert.save();
            let mailOptions={
                from:{
                    name:'Joshua',
                    address:'joshua00521202021@msijanakpuri.com'
                },
                to:req.userdetail.email,
                subject:'Alert',
                text:`Alert Regarding coin ${newAlert} ` ,
                html:`dear user ${email} a new Alert target of coin ${newAlert}  have been Update to ${target}`
                      }
                sendmail(mailOptions)
            res.json({ message: "Alert set" });


        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to set alert' });
    }
});

// Function to check alerts
const checkAlerts = async () => {
    try{
        console.log("checkalerts")
        const result=await AlertData.find() 

        if(result){
            for(const data of result){
                const options = {
                    method: 'GET',
                    url: `https://api.coingecko.com/api/v3/simple/price?ids=${data.coinid}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=full`,
                    headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-ZWBTZ8bBrdtfTWSPGC99mkFx' }
                };
                console.log("checking price of",data)
    
                const response=await axios.request(options)
                if(response){
                    console.log(response.data)
                }
                console.log(response.data[data.coinid].usd)
    
                if(data.target<=response.data[data.coinid].usd){
                    console.log("alert sended to",data.user_email)
                    let mailOptions={
                        from:{
                            name:'Joshua',
                            address:'joshua00521202021@msijanakpuri.com'
                        },
                        to:data.user_email,
                        subject:'Alert',
                        text:`Alert Regarding coin ${data.coinid} ` ,
                        html:`dear user ${data.user_email} the price of ${data.coinid} has crossed your target price of ${data.target} , now it have reached ${response.data[data.coinid].usd} `
                              }
                        sendmail(mailOptions)
                        await AlertData.deleteOne({coinid:data.coinid,user_email:data.user_email})
    
                }else{
                    console.log("no alert found")
                }
    
            }
        }

      

        

    }catch(error){

    }
};

// Check alerts periodically
setInterval(checkAlerts, 60000); // Check every 60 seconds

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  })