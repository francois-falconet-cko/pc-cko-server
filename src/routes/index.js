const checkoutRouter = require('../ressources/checkout/routes');

module.exports = (app) => {
	app.use('/checkout', checkoutRouter);
};
