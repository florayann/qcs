import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';


var FakeAuthDialog = React.createClass({
    getInitialState: function() {
	return {username: "", open: true, attemptedSubmit: false};
    },
    handleChange: function(e) {
	this.setState({
	    username: e.target.value,
	});
    },
    handleLogin: function() {
	this.props.onLogin({username: this.state.username});
	this.setState({attemptedSubmit: true});
    },
    handleKeyPress: function(target) {
	if (target.charCode == 13) {
            this.handleLogin();
	}
    },
    render: function () {
	const actions = [
	    <FlatButton
		label="Login"
		primary={true}
		onTouchTap={this.handleLogin}
	    />,
	];
	
	return (
	    <Dialog
		title="Login"
		actions={actions}
		modal={true}
		open={this.state.open}
            >
		<TextField
		    hintText="NetID"
		    errorText={(!this.state.attemptedSubmit || this.state.username) ?
			       "" :
			       "This field is required"}
		    floatingLabelText="NetID"
		    onChange={this.handleChange}
		    onKeyPress={this.handleKeyPress}
		    autoFocus={true}
		    value={this.state.username}
		/>
            </Dialog>
	);
    }
});


export default FakeAuthDialog;
