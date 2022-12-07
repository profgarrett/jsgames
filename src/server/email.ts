const { DEBUG, EMAIL_ADDRESS, EMAIL_HOST, EMAIL_PASSWORD } = require('./secret'); 
const nodemailer = require('nodemailer');

async function send_email(email: string, title: string, message: string) {

	// If we are in dev mode, then don't actually send. Sending only works on the server.
	if(DEBUG) {
		console.log({ email, title, message });
		return;
	}

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

	const info1 = await transporter.sendMail({
		from: '"Nathan @ Excel.fun" <Nathan@Excel.fun>', // sender address
		to: email, 
		subject: title,
		text: message
	});

	// Send a copy to my email as well.
	const info2 = await transporter.sendMail({
		from: '"Nathan @ Excel.fun" <Nathan@Excel.fun>', // sender address
		to: 'profgarrett@gmail.com', 
		subject: title,
		text: message
	});

	//console.log(info1);
}

export {
	send_email
}