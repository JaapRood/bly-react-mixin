var createAppContextMixin = require('react-app-context-mixin');

var slice = Array.prototype.slice;

var mixin = createAppContextMixin(function(props) {
	assertBlyFound(props);

	return {
		bly: props.bly
	};
}, 'appContext');

mixin.stores = function(name) {
	var app = this._getBly();

	if (typeof name !== 'string') {
		throw new Error("Name of store (or function with 'storeName' prop) required to retrieve a store");
	}

	return app.stores(name);
};

mixin.inject = function(actionNameOrCreator) {
	var app = this._getBly(),
		args = slice.call(arguments); // get rid of the first argument

	if (typeof actionNameOrCreator === 'function') {
		args = slice.call(args, 1);
		args.unshift(app);

		actionNameOrCreator.apply(null, args);
	} else {
		app.inject.apply(app, args);
	}

	return;	
};

mixin._getBly = function() {
	var context = this.getAppContext();
	assertBlyFound(context);

	return context.bly;
};

function assertBlyFound(context) {
	if (!context.bly) {
		throw new Error("Can't find the Bly App to which this component belongs. Make sure to pass a reference to your app to your top-level component using the 'bly' prop");
	}
} 

module.exports = mixin;