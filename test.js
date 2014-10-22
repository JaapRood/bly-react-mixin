var test = require('tape');
var extend = require('extend-object');

var mixin = require('./.');

var mockComponent = function(app) {
	return extend({
		props: { bly: app },
		context: {}
	}, mixin);
};

test('stores reference to app using app context', function(t) {
	t.plan(3);

	var app = { inject: function() {} };
	var rootComponent = mockComponent();

	t.throws(function() {
		var context = rootComponent.getAppContext();
	}, 'requires `bly` to be available on props');


	rootComponent = mockComponent(app);

	t.doesNotThrow(function() {
		var context = rootComponent.getAppContext();

		t.equals(context.bly, app, 'app available on the app context');

	}, 'can create new app contexts when `bly` prop available');

});

test('mixin.stores', function(t) {
	t.plan(4);

	var storeName = 'messages';
	var messagesStore = { messages: ['woo'] };

	var component = mockComponent({
		stores: function(name) {
			t.equals(name, storeName);

			return messagesStore;
		}
	});

	t.throws(function() {
		component.stores();
	}, 'name of store to retrieve is required');

	t.doesNotThrow(function() {
		var store = component.stores(storeName);

		t.equals(store, messagesStore, 'returns requested store');
	}, 'can retrieve stores by their name');

});

test('mixin.inject', function(t) {
	t.plan(7);

	var expectedAction = 'RECEIVE_MESSAGES';
	var expectedPayload = { messages: ['woo'] };

	var app = {
		inject: function(action, payload) {
			t.equals(app, this, 'should be called in context of the app');
			t.equals(action, expectedAction, 'action should make it to app.inject');
			t.equals(payload, expectedPayload, 'payload should make it to app.payload');
		}
	};
	var component = mockComponent(app);

	t.doesNotThrow(function() {
		component.inject(expectedAction, expectedPayload);
	}, 'can dispatch actions with payload directly');

	var actionCreator = function(appInstance, message) {
		t.equals(appInstance, app, 'action creators get the app as the first argument');
		t.equals(message, 'woo', 'any other arguments get forwarded');
	}

	t.doesNotThrow(function() {
		component.inject(actionCreator, 'woo');
	}, 'can let an action creator (function) do all the work');

});