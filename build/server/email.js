//      
const { EMAIL_ADDRESS, EMAIL_HOST, EMAIL_PASSWORD } = require('./secret.js'); 
const nodemailer = require('nodemailer');



async function send_email(email        , title        , message        ) {

	// Send email.
	const transporter = nodemailer.createTransport({
		host:  EMAIL_HOST, 
		port: 587,
		secure: false, 
		requireTLS: true,
		tls: {
			rejectUnauthorized: false
		},
		auth: {
			user: EMAIL_ADDRESS,
			pass: EMAIL_PASSWORD
		}
	});

	const info = await transporter.sendMail({
		from: '"Nathan @ Excel.fun" <Nathan@Excel.fun>', // sender address
		to: email, 
		subject: title,
		text: message
	});
	console.log(info);
}

module.exports = {
	send_email
};