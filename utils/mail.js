const mailgen = require('mailgen');
const nodemiler = require('nodemailer');
require('dotenv').config();

const userVerficationContent = (username, verificationUrl)=>{
    return {
        body: {
            name: username,
            intro: 'Welcome to our site! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify , please click here:',
                button: {
                    color: '#22BC66',  
                    text: 'Confirm your email-account',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const resetPasswordContent = (username, passwordResetUrl)=>{
    return{
        body: {
            name: username,
            intro: 'Welcome to our site! We\'re very excited to have you on board.',
            action: {
                instructions: 'To reset pasword , please click here:',
                button: {
                    color: '#22BC66',  
                    text: 'Reset your password',
                    link: passwordResetUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

//Generate the mail, transport and send the generated mail via the transporter

const sendEmail = async (options)=>{
    const mailGenerator = new mailgen({
        theme:'default',
        product:{
            name:'Organisation',
            link:'https://demolink.com'
        }
    })

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);  

    const transporter = nodemiler.createTransport({
        host:process.env.MAILTRAP_HOST,
        port:process.env.MAILTRAP_PORT,
        auth:{
            user:process.env.MAILTRAP_USERNAME,
            pass:process.env.MAILTRAP_PASSWORD
        }
    });

    const mail = {
        from:'Organisation@gmail.com',
        to:options.email,
        subject:options.subject,
        text:emailText,
        html:emailHtml
    }

    try{
        await transporter.sendMail(mail);
    }catch(err){
        console.log(err);
        console.log(`Error while sending email`);
    }
}

module.exports = {
    userVerficationContent,
    resetPasswordContent,
    sendEmail
}