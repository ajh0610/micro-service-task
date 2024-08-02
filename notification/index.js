const {Worker} = require("bullmq");
const nodemailer = require('nodemailer');
require("dotenv").config();
const express = require('express');
const PORT = process.env.NOTIFICATION_SERVICE_PORT;


const app = express();

let config = {
    service: process.env.NOTIFICATION_SERVICE,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }
}

let transporter = nodemailer.createTransport(config);

// creating a worker that will fetch the newly added information to the mailing queue
const worker = new Worker('mailing-queue', async (job) => {

    const mailData = {
        from: process.env.USER_EMAIL,
        ...job.data
    }
    // Using nodemailer to send the mail
    transporter.sendMail(mailData).then((info)=>{
        console.log("=========Email sent succesfully to", info.envelope.to[0]);
    }).catch(e=>{
        console.log(e)
    })
    
}, {
    connection: {
        host: process.env.BULLMQ_HOST,
        port: process.env.BULLMQ_PORT
    }
});

// Starting the server

app.listen(PORT, ()=>{
    console.log(`Notification Service is lisiting on ${PORT}`)
})