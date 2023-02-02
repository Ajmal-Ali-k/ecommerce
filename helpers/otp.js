require("dotenv/config");





const serviceId = process.env.ServiceSID
const accountSid = process.env.AccountSID ;
const authToken = process.env.AuthToken;
const client = require('twilio')(accountSid, authToken);


function sendotp(sendotpphone){
    console.log('calling========================');

client.verify.v2.services(serviceId)
                .verifications
                .create({to: `+91${sendotpphone}`, channel: 'sms'})
                .then(verification => console.log(verification.status));
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