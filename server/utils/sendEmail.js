import nodeMailer from "nodemailer";

export const sendEmail = async({email, subject, message})=>{
//creating a transporter

const transporter = nodeMailer.createTransport({
    host:process.env.SMTP_HOST,
    service:process.env.SMTP_SERVICE,
    port:process.env.SMTP_PORT,
    auth:{
        user:process.env.SMTP_MAIL,                 //user of the email from which the email will be sent
        pass:process.env.SMTP_PASSWORD,              //password and user of the email from which the email will be sent
    }
});

const options ={
    from : process.env.SMTP_MAIL,
    to: email,                //email and subject are the parameters that we are passing to the sendEmail function
    subject,
    html: message,            //message is the parameter that we are passing to the sendEmail function in form of html, if used text in other file then it will be in text form
};

await transporter.sendMail(options); //sending the email to the user using the transporter
};