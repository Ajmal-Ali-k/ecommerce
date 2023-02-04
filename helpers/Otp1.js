const User = require("../model/user/userModel");

require("dotenv/config");
const serviceId = process.env.ServiceSID
const accountSid = process.env.AccountSID ;
const authToken = process.env.AuthToken;
const client = require('twilio')(accountSid, authToken);









const otp_post = async (req,res) =>{
    const user =req.session.user
    const mobile = req.body.mobile
    if(user){
        res.redirect('/login')
    }else{
            if(await User.findOne({ phoneNo:mobile})){
                
                console.log("phone nimber already exist")
            }else{
                client.verify.v2.services(serviceId)
                .verifications
                .create({to: `+91${mobile}`, channel: 'sms'})
                .then(verification => console.log(verification.status));

            }
            

    }
}

const verify_otp = async (req,res) =>{
    const user = req.session.user
    const mobile = req.body.mobile
}


function varifyotp(phone,otp){
 console.log("verifying")
     return new Promise((resolve,reject)=>{
       

        console.log("inside funtion")
        client.verify.v2.services(serviceId)
        .verificationChecks
        .create({to: `+91${phone}`, code: otp})
        .then((verification_check) =>{ 
            console.log(verification_check.status);
      resolve(verification_check)
    })

})
}


module.exports ={
    sendotp,
    varifyotp
}