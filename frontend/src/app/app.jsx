import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import $ from 'jquery';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import DocumentTitle from 'react-document-title';

import QAppBar from './QAppBar';
import QDrawer from './QDrawer/QDrawer';
import Kids from './Kids/Kids';
import styles from './styles';

injectTapEventPlugin();

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

var LoggedOut = React.createClass({
    render: function () {
	return (
	    <div style={styles.container}>
		<Card>
		    <CardHeader
			title="Logged out!"
		    />
		</Card>
	    </div>
	);
    }
});

var App = React.createClass({
    getInitialState: function() {
	return {open:false,
		queueName: "q.cs",
		queueId: 0,
		queueInstructor: false,
		classes: {},
		username: "",
		refresh: false,
	};
    },
    handleLeftIconButtonTouchTap: function (e) {
	this.setState({open: !this.state.open});
    },
    handleSelectQueue: function(queueId, queueName) {
	if (queueId === undefined) {
	    queueId = 0;
	}
	if (queueName === undefined) {
	    queueName = "q.cs"
	}

	this.setState({queueId: queueId, queueName: queueName, queueInstructor: false});
	this.setState({open: false});
	this.isQueueInstructor(queueId);
    },
    isQueueInstructor: function(queueId) {
	$.ajax({
	    url: "/instructor" + this.props.queue_url + queueId,
	    dataType: 'json',
	    type: 'GET',
	    success: function(data) {
		this.setState({queueInstructor: true});
	    }.bind(this),
	    error: function(xhr, status, err) {
		this.setState({queueInstructor: false});
	    }.bind(this)
	});
    },
    handleLogin: function(data) {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify(data),
	    success: function(data) {
		this.setState({username: data.username});
		this.setState({open: true});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.login_url, status, err.toString());
	    }.bind(this)
	});
    },
    checkLoggedIn: function() {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'GET',
	    success: function(data) {
		this.setState({username: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.login_url, status, err.toString());
	    }.bind(this)
	});
    },
    handleLogout: function() {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'DELETE',
	    success: function(data) {
		this.setState({username: null});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.login_url, status, err.toString());
	    }.bind(this)
	});
    },
    handleRefresh: function() {
	this.setState({refresh: !this.state.refresh});
    },
    loadClassesFromServer: function() {
	$.ajax({
	    url: this.props.class_url,
	    dataType: 'json',
	    cache: false,
	    success: function(data) {
		this.setState({classes: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    setTimeout(this.loadClassesFromServer, 2000);
		}
	    }.bind(this)
	})
    },
    componentDidMount: function() {
	this.checkLoggedIn();
	this.loadClassesFromServer();
    },
    render: function() {
	return(
	    <MuiThemeProvider>
		{this.state.username != null ? (
		     <div>
			 <QAppBar queueName={this.state.queueName}
				  onLeftIconButtonTouchTap={this.handleLeftIconButtonTouchTap}
				  onLogout={this.handleLogout}
				  onRefresh={this.handleRefresh}
			 />
			 <QDrawer
			     open={this.state.open}
			     onRequestChange={this.handleLeftIconButtonTouchTap}
			     classes={this.state.classes}
			     onSelectQueue={this.handleSelectQueue}
			     url={this.props.queues_url}
			     queue_url={this.props.queue_url}
			     queueId={this.state.queueId}
			     instructor={this.state.queueInstructor}
			 />

			 {__FAKEAUTH__ && !this.state.username ?
			  <FakeAuthDialog onLogin={this.handleLogin} /> : null}

			 {this.state.queueId == 0 ? null : 
			  <Kids url={this.props.queue_url + this.state.queueId}
				queueId={this.state.queueId}
				queueName={this.state.queueName}
				instructor={this.state.queueInstructor}
				username={this.state.username}
				refresh={this.state.refresh}
				onSelectQueue={this.handleSelectQueue}
			  />}
			  
		     </div>) : <LoggedOut />}
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <DocumentTitle title="q.cs">
	<App class_url="/classes"
	     queue_url="/queue/"
	     queues_url="/class/"
	     login_url="/auth"
	/>
    </DocumentTitle>,
    document.getElementById('app')
);
