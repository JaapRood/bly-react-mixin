var createAppContextMixin = require('react-app-context-mixin');

var slice = Array.prototype.slice;

var mixin = createAppContextMixin(function(props) {
	if (!props.app) {
		throw new Error("Can't find the Bly App to which this component belongs");
	}

	return {
		app: props.app
	};
}, 'appContext');

mixin.stores = function(name) {
	var context = this.getAppContext();
	if (!context.app) {
		throw new Error("Can't find the Bly App to which this component belongs");
	}

	if (typeof name !== 'string') {
		throw new Error("Name of store (or function with 'storeName' prop) required to retrieve a store");
	}

	return context.app.stores(name);
};

mixin.intentTo = function(actionNameOrCreator) {
	var context = this.getAppContext(),
		app = context.app,
		args = slice.call(arguments, 1); // get rid of the first argument

	if (typeof actionNameOrCreator === 'function') {
		args.unshift(app);

		actionNameOrCreator.apply(null, args);
	} else {
		app.inject.apply(app, args);
	}

	return;	
};

module.exports = mixin;