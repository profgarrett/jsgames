const { DEBUG, EMAIL_ADDRESS, EMAIL_HOST, EMAIL_REPLYTO, EMAIL_PORT, EMAIL_PASSWORD } = require('./secret'); 
const nodemailer = require('nodemailer');


if(typeof EMAIL_REPLYTO === 'undefined') {
	throw new Error('Invalid Email reply to option');
}


async function send_email(email: string, title: string, message: string) {

	// If we are in dev mode, then don't actually send. Sending only works on the server.
	if(DEBUG) {
		console.log({ email, title, message });
		//return;
	}

	try {
		// Send email.
		const transporter = nodemailer.createTransport({
			host:  EMAIL_HOST, 
			port: EMAIL_PORT,
			secure: true, 
	//		requireTLS: true,
			tls: {
				rejectUnauthorized: false
			},
			auth: {
				user: EMAIL_ADDRESS,
				pass: EMAIL_PASSWORD
			}
		});


		console.log([EMAIL_ADDRESS, EMAIL_REPLYTO, EMAIL_HOST]);

		// cc options don't seem to work on dreamhost.
		const info1 = await transporter.sendMail({
			from: EMAIL_ADDRESS, // sender address
			replyTo: EMAIL_REPLYTO,
			to:email,
			cc: EMAIL_REPLYTO,
			subject: title,
			text: message
		});
		
		// send second email to keep an eye on emails.
		/*
		const info2 = await transporter.sendMail({
			from: EMAIL_ADDRESS, // sender address
			to: EMAIL_REPLYTO,
			subject: title,
			text: message
		});
		*/
		console.log(info1);
	}
	catch(e) {
		console.log(e);
	}
}

export {
	send_email
}