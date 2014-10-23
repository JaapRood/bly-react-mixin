# React mixin to easily integrate with the Bly flux framework [![Build Status](https://travis-ci.org/JaapRood/bly-react-mixin.svg?branch=master)](https://travis-ci.org/JaapRood/bly-react-mixin)

[Bly](https://github.com/JaapRood/bly) and [React](http://reactjs.org) make for a really good couple, it's what Bly was designed with in mind. This mixin is the glue to their relationship, letting you access stores and dispatch actions from your React components.

## Usage

Simply pass in your Bly app to your top level component using the 'bly' prop. This will give it and all of it's children that also use the mixin access to Bly's `app.stores` (read-only) and `app.inject`. Do this in Bly's `app.render` and you're all golden.


```js
var Bly = require('bly');
var React = require('react');
var BlyReactMixin = require('bly-react-mixin');
var MessagesStore = require('./stores/messages-store');

var YourAppComponent = React.createClass({

	mixins: [BlyReactMixin],
	
	getInitialState: function() {
		// access a store of your bly app
		return {
			latestMessage: this.stores('messages').last()
		};
	},

	render: function() {

		return React.DOM.div({
			onClick: this.onClickMessage
		}, this.state.lastMessage.text);

		// could have been JSX just as easily
		// <div onClick={this.onClickMessage}>
		//	{this.state.lastMessage.text}
		// </div>
	},

	onClickMessage: function(e) {
		// dispatch actions
		this.inject('MESSAGE_READ', this.state.latestMessage.id);
	}
});


var app = new Bly.App();

app.stores('messages', new MessagesStore());
app.action({
	name: 'MESSAGE_READ',
	handler: function(waitFor, messageId) {
		app.stores('messages').onRead(messageId);
	}
});

// setup rendering 

app.render(function() {
	
	React.renderComponent(YourAppComponent({
		bly: app
	}), document.documentElement);
});

```

### Components created outside of components' render method

As long as the components are created inside the top level component or one of it's children, you don't have to pass around the `bly` prop manually. However, if a component is created somewhere else, you'll have to pass the app using the `bly` prop manually. The easiest way is to use the provided `cloneWithBly` method.

```js
var React = require('react');
var BlyReactMixin = require('bly-react-mixin');


var MessageComponent = React.createClass({
	mixins: [BlyReactMixin],

	getInitialState: function() {
		return {
			latestMessage: this.stores('messages').last()
		};
	};

	render: function() {
		return React.DOM.div({}, 'foo');
	}
});

// When creating the child inside a component, you don't have to pass it manually
var FirstMessageApp = React.createClass({
	mixins: [BlyReactMixin],

	render: function() {
		// no need to manually pass bly
		return React.DOM.div({},
			MessageComponent()
		);
	}
});


// If the component is created elsewhere, outside of a component with access to the Bly app, 
// your bly instance needs to be passed in. You can do this manually, but can also use the 
// provided `this.cloneWithBly` for convenience

var SecondMessageApp = React.createClass({
	mixins: [BlyReactMixin],

	render: function() {
		// 
		return React.DOM.div({},
			this.cloneWithBly(this.props.children) // injects bly into the component(s) we're rendering
		);
	}
});


```

## API

### var store = component.stores(name)

Retrieve a reference to a store instance.

- `name` - (required) name of the store you want to retrieve.

### component.inject(action, payload)

Inject an action into the system to be dispatched. The dispatching of an action is *synchronous* and only one action can be dispatched at a time.

- `action` - (required) the name of the action you want to inject. For example `RECEIVE_MESSAGES`.
- `payload` - the payload of the action, can be any value. Defaults to an empty object `{}`.


### component.inject(actionCreator [, args...])

Let an 'action creator' (read: function) handle the dispatching of an action, which is especially useful with the more complex actions. All other arguments will be passed to the action creator.

- `actionCreator` - (required) a function with the signature `function(app, args..)` where:
	- `app` - instance of your bly app
	- `args...` - any arguments passed to `component.inject` after the action creator
