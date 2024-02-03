const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/payments', controller.payments)
router.get('/payments/:id', controller.getPaymentDetails)
router.post('/payment-sessions', controller.createPaymentSession)


module.exports = router;
