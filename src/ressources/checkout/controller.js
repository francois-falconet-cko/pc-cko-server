const { Checkout } = require('checkout-sdk-node');
const constants = require('../../tools/constants');
const axios = require("axios");

exports.payments = async (req, res) => {

	let payment;
	let source;
	let store_for_future_use;
	let genericPayload = {
		customer: {
			email: req.body.email,
			name: req.body.name,
		},
		currency: req.body.currency,
		amount: req.body.amount,
		reference: req.body.reference,
		success_url: req.body.success_url,
		failure_url: req.body.failure_url,
	};

	try {
		console.log(req.body)

		const cko = new Checkout(merchantConfig.secretKey, { pk: merchantConfig.publicKey, timeout: 7000 });

		if (req.body.store_for_future_use && req.body.store_for_future_use == 'true')
			store_for_future_use = true;
		else
			store_for_future_use = false;

		if (req.body.token) {
			source = {
				token: req.body.token,
				store_for_future_use: store_for_future_use
			}
		}
		if (req.body.source && req.body.source != 'paypal') {
			source = {
				type: "id",
				id: req.body.source,
			}
		}
		if (req.body.source && req.body.source === 'paypal') {
			source = {
				type: "paypal",
			}
		}
		if (req.body.source && req.body.source === 'alma') {
			source = {
				type: "alma",
			}
		}

		genericPayload = { ...genericPayload, source};

		
		if (req.body.source === 'paypal') {
			genericPayload = { ...genericPayload, "items":[
			{	
				"name": "laptop",
				"unit_price": req.body.amount,
				"quantity": 1}]
			};
		}

		if (req.body.source === 'alma') {
			genericPayload = { ...genericPayload, "capture": true};
		}
		
		if(req.body.securePayment == 'true') {
			genericPayload = { ...genericPayload, "3ds":{enabled:true}};
		}

		console.log(genericPayload);
		payment = await cko.payments.request(genericPayload);

		console.log(payment)
		if(payment) res.status(200).send(payment);

	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
};


exports.getPaymentDetails = async (req, res) => {

	try {
		console.log(req.params.id)
		const cko = new Checkout(constants.CKO_SECRET_KEY, { pk: constants.CKO_PUBLIC_KEY, timeout: 7000 });

		const paymentDetails = await cko.payments.get(req.params.id);
		console.log(paymentDetails);
		if(paymentDetails) {
			res.status(200).send(paymentDetails);
		}

	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
};


exports.getToken = async (req, res) => {
	console.log(`get Token for  ${req.body.signature} and ${req.body.type} `);
	try {
		const cko = new Checkout(constants.CKO_SECRET_KEY, { pk: constants.CKO_PUBLIC_KEY, timeout: 7000 });
		
		const tokenRequest = {
			token_data: {
				protocolVersion: req.body.protocolVersion,
				signature: req.body.signature,
				signedMessage: req.body.signedMessage,
			  },
			type: req.body.type,
		};

		const tokenReponse = await cko.tokens.request(tokenRequest);
		res.status(200).send(tokenReponse);
		

	} catch (error) {
		if (error.message == 'NotFoundError')  
			return res.status(404).send(error);
		else 
			return res.status(500).send(error);
	}
};


exports.createPaymentSession = async (req, res) => {

	try {

		const config = {
			headers: { 
				Authorization: `Bearer ${constants.CKO_SECRET_KEY}`,
				'Content-Type': 'application/json' }
		};

		let data = {
			amount: parseInt(req.body.amount),
			currency: req.body.currency,
			reference: req.body.reference,
			billing: {
				address: {
					country: req.body.country
				}
			},
			customer: {
			name: req.body.name,
			email: req.body.email
			},
			success_url: req.body.success_url,
			failure_url: req.body.failure_url
		};
		
		if(req.body.securePayment == 'true') {
			data = { ...data, "3ds":{ enabled:true }};
		}
		console.log(data)

		const response = await axios.post('https://api.sandbox.checkout.com/payment-sessions',
			data,
			config);

		return res.status(200).send(response.data);


	} catch (error) {
		console.log(error?.response?.data);
		return res.status(500).send(error);
	}
};


