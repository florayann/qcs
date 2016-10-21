import React from 'react';
import {List, ListItem} from 'material-ui/List';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ActionDone from 'material-ui/svg-icons/action/done';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';

import seedrandom from 'seedrandom';
import tinycolor from 'tinycolor2';
import FlipMove from 'react-flip-move';
import ReactTimeout from 'react-timeout';
import DocumentTitle from 'react-document-title';
import _ from 'underscore';
import $ from 'jquery';

import styles from './styles';

var material_palette = require("!json!./material_palette.json");

var KidsList = React.createClass({
    checkMobile: function() {
	if (window.matchMedia("only screen and (max-width: 760px)").matches) {
            this.setState({s: styles.containerMobile});
	}
	else {
	    this.setState({s: styles.container});
	}
    },
    componentWillMount: function() {
        this.checkMobile();
    },
    componentDidMount: function() {
        window.addEventListener("resize", this.checkMobile);
    },
    componentWillUnmount: function() {
        window.removeEventListener("resize", this.checkMobile);
    },
    render: function() {
	var kidsNodes = this.props.data.map(function(kid) {
	    return (
		<Kid name={kid.name}
		     room={kid.room}
		     question={kid.question}
		     id={kid.id}
		     answer={kid.answer}
		     key={kid.id}
		     onKidDelete={this.props.onKidDelete}
		     onKidAnswer={this.props.onKidAnswer}
		     username={this.props.username}
		     instructor={this.props.instructor}
		/>
	    );
	}.bind(this));
	return (
	    <div className="kidsList" style={this.state.s}>
		    <FlipMove enterAnimation="accordianVertical" leaveAnimation="accordianVertical">
			{kidsNodes}
		    </FlipMove>
		<AddKid onKidSubmit={this.props.onKidSubmit}/>
	    </div>
	);
    }
});

var AddKid = React.createClass({
    getInitialState: function() {
	return {name: '',
		room: '',
		question:'',
		expanded:false,
		attemptedSubmit: false
	};
    },
    handleNameChange: function(e) {
	this.setState({name: e.target.value});
    },
    handleRoomChange: function(e) {
	this.setState({room: e.target.value});
    },
    handleQuestionChange: function(e) {
	this.setState({question: e.target.value});
    },
    handleExpandChange: function(expanded) {
	this.setState({expanded: expanded});
    },
    reduce: function() {
	this.setState({expanded: false});
    },
    submitKid: function(e) {
	this.props.onKidSubmit({
	    name: this.state.name.trim(),
	    room: this.state.room.trim(),
	    question: this.state.question.trim(),
	});
	this.setState({name: '', room: '', question:'', attemptedSubmit: false});
	this.reduce();
    },
    handleKeyPress: function(target) {
	if (target.charCode == 13) {
	    if (this.state.name && this.state.room && this.state.question) {
		this.submitKid();
	    }
	    else {
		this.setState({attemptedSubmit: true});
	    }
	}
    },
    render: function() {
	return (
	    <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
		<CardHeader
		    title="New Question"
		    subtitle="Expand to add!"
		    actAsExpander={true}
		    showExpandableButton={true}
		    avatar={<Avatar>{this.state.expanded ? "-" : "+"}</Avatar>}
		/>
		<CardText expandable={true}>
		    <TextField
			hintText="Name"
			floatingLabelText="Name"
			errorText={!this.state.attemptedSubmit || this.state.name ?
				   "" :
				   "This field is required"}
			value={this.state.name}
			onChange={this.handleNameChange}
			onKeyPress={this.handleKeyPress}
			autoFocus={true}
		    />
		    <br/>
		    <TextField
			hintText="Room"
			floatingLabelText="Room"
			errorText={!this.state.attemptedSubmit || this.state.room ?
				   "" :
				   "This field is required"}
			value={this.state.room}
			onChange={this.handleRoomChange}
			onKeyPress={this.handleKeyPress}
		    />
		    <br/>
		    <TextField
			hintText="Question"
			floatingLabelText="Question"
			errorText={!this.state.attemptedSubmit || this.state.question ?
				   "" :
				   "This field is required"}
			value={this.state.question}
			onChange={this.handleQuestionChange}
			onKeyPress={this.handleKeyPress}
		    />
		    <br/>
		    <CardActions>
			<FlatButton
			    label="Submit" disabled={!(this.state.name && this.state.room && this.state.question)}
			    onTouchTap={this.submitKid}
			/>
		    </CardActions>
		</CardText>
	    </Card>
	);
    }
});

var Kid = React.createClass({
    getInitialState: function() {
	var color = this.generateColor();
	return ({color: color,
		       complement: tinycolor(color).complement().toHexString()
	});
    },
    handleButtonTouchTap: function(e) {
	this.props.onKidDelete({id: this.props.id});
    },
    handleTouchTap: function(e) {
	this.props.onKidAnswer({id: this.props.id,
				name: this.props.name,
				room: this.props.room,
				question: this.props.question,
				answer: !this.props.answer,
				});
    },
    generateColor: function() {
	var n = Math.seedrandom(this.props.id);
	var groups = Object.keys(material_palette);
	var group = groups[Math.floor(groups.length * Math.random())];
	var colors = Object.keys(material_palette[group]);
	var coloridx = Math.floor(colors.length * Math.random());
	var color = material_palette[group][colors[coloridx]];
	return color;
    },
    render: function() {
	return (
	    <Card>
		<ListItem
		    primaryText={this.props.name + " - " + this.props.room}
		    secondaryText={this.props.question}
		    leftAvatar={<Avatar backgroundColor={this.state.color} >{this.props.name[0]} </Avatar>}
		    onTouchTap={this.props.instructor ? this.handleTouchTap : undefined}
		    leftIcon={this.props.answer ? <CircularProgress color={this.state.complement} size={0.75} style={styles.progress}/> : null}
		    rightIconButton={this.props.instructor || this.props.username == this.props.id ?
		     (
			 <IconButton
			     onTouchTap={this.handleButtonTouchTap}>
			     <ActionDone/>
			 </IconButton>
			) : null}
		/>
	    </Card>
	);
    }
});

var Kids = ReactTimeout(React.createClass({
    getInitialState: function() {
	return {data: [],
		snackOpen: false,
		deletedKid: null,
		notificationOpen: false,
		notificationMessage: "Notification",
	};
    },
    hasSameId: function(kid, other) {
	return kid.id == other.id;
    },
    rejectDeletedKid: function(data, deletedKid=this.state.deletedKid) {

	if (deletedKid) {
	    return _.reject(data, function (kid) {
		return this.hasSameId(kid, deletedKid);
	    }.bind(this));
	}
	return data;
    },
    clearAndSetTimeout: function(timerIdProperty, ...rest) {
	this.props.clearTimeout(this.state.loadKidsTimerId);
	
	this.setState({
	    [timerIdProperty]: this.props.setTimeout(...rest)
	});
    },
    loadKidsFromServer: function(force) {
	var len = this.state.data.length;
	var oldUrl = this.props.url;

	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    data: force ? {force: force} : {},
	    success: function(data) {
		if (oldUrl == this.props.url) {
		    data = this.rejectDeletedKid(data);
		    this.setState({data: data});
		    if (this.props.instructor && len < this.state.data.length) {
			this.refs.notify.play();
		    }
		    this.clearAndSetTimeout("loadKidsTimerId",
					    this.loadKidsFromServer,
					    0);
		}
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (xhr.status != 410) {
		    this.clearAndSetTimeout("loadKidsTimerId",
					    this.loadKidsFromServer,
					    2000,
					    force);
		}
		else {
		    this.displayNotification("Queue deleted",
					     0,
					     "Okay",
					     this.handleOkayQueueDeleted,
					     function () {},
		    )
		}
	    }.bind(this)
	});
    },
    refreshKidsFromServer: function(props) {
	props = props || this.props;

	$.ajax({
	    url: props.url,
	    dataType: 'json',
	    cache: false,
	    data: {force: true},
	    success: function(data) {
		data = this.rejectDeletedKid(data);
		this.setState({data: data});
		this.clearAndSetTimeout("loadKidsTimerId",
					this.loadKidsFromServer,
					2000);
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});

    },
    componentWillReceiveProps: function(nextProps) {
	if ((nextProps.refresh != this.props.refresh) ||
	    (nextProps.url != this.props.url)) {
	    this.refreshKidsFromServer(nextProps);
	}
    },
    displayNotification: function(message,
				  ms=2000,
				  actionText="Okay",
				  action=this.dismissNotification,
				  onRequestClose=this.dismissNotification) {
	this.setState({
	    notificationOpen: true,
	    notificationMessage: message,
	    notificationActionText: actionText,
	    notificationMs: ms,
	    notificationAction: action,
	    notificationOnRequestClose: onRequestClose,
	});
    },
    dismissNotification: function() {
	this.setState({
	    notificationOpen: false,
	});
    },
    handleKidSubmit: function(kid) {
	var url = this.props.instructor ?
		  "/instructor" + this.props.url :
		  this.props.url;
	
	$.ajax({
	    url: url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify(kid),
	    success: function(data) {
		data = this.rejectDeletedKid(data);
		this.setState({data: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    this.clearAndSetTimeout("submitKidTimerId",
					    this.handleKidSubmit,
					    2000,
					    kid);
		}
		else if (xhr.status == 409) {
		    this.displayNotification("Adding has been disabled", 2000);
		}
	    }.bind(this)
	});
    },
    handleKidDelete: function(kid) {
	var url = this.props.instructor ?
		  "/instructor" + this.props.url :
		  this.props.url;
	$.ajax({
	    url: url,
	    dataType: 'json',
	    type: 'DELETE',
	    data: {id: kid.id},
	    success: function(data) {
		this.setState({data: data, deletedKid: null});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    this.clearAndSetTimeout("deleteKidTimerId", this.handleKidDelete, 2000, kid);
		}
		else {
		    this.setState({deletedKid: null});
		}
	    }.bind(this)
	});
    },
    handleSnackRequestClose: function(reason) {
	if (reason) {
	    this.setState({snackOpen: false});
	    this.handleKidDelete(this.state.deletedKid);
	}
    },
    handleOkayQueueDeleted: function(e) {
	this.props.onSelectQueue();
    },
    componentDidMount: function() {
	this.loadKidsFromServer(true);
    },
    getDocumentTitle: function() {
	if (this.props.queueId == 0) {
	    return "q.cs";
	}
	
	var len = this.state.data.length;
	var lenstring = "";

	if (len) {
	    lenstring = "(" + len + ") ";
	}

	return lenstring + this.props.queueName;
    },
    tentativeKidDelete: function(kid) {
	if (this.state.deletedKid) {
	    /* No op; just let the previous one delete. */
	    return;
	}

	var tempData = this.rejectDeletedKid(this.state.data, kid);
	
	this.setState({deletedKid: kid,
		       snackOpen: true,
		       data: tempData,
	});
    },
    deleteKid: function() {
	this.handleKidDelete(this.state.deletedKid);
    },
    undoKidDelete: function() {
	this.setState({deletedKid: null,
		       snackOpen: false,
	});
	this.refreshKidsFromServer();
    },
    render: function() {
	return (
	    <DocumentTitle title={this.getDocumentTitle()}>
	    <div className="Kids">
		<KidsList data={this.state.data}
			  onKidSubmit={this.handleKidSubmit}
			  onKidDelete={this.tentativeKidDelete}
			  onKidAnswer={this.handleKidSubmit}
			  username={this.props.username}
			  instructor={this.props.instructor}
		/>
		<audio ref="notify">
		    <source src="/notify.wav" type="audio/wav"/>
		</audio>

		<Snackbar
		    open={this.state.snackOpen}
		    message="Removed from queue"
		    action="undo"
		    autoHideDuration={3000}
		    onActionTouchTap={this.undoKidDelete}
		    onRequestClose={this.handleSnackRequestClose}
		/>

		<Snackbar
		    open={this.state.notificationOpen}
		    message={this.state.notificationMessage}
		    action={this.state.notificationActionText}
		    autoHideDuration={this.state.notificationMs}
		    onActionTouchTap={this.state.notificationAction}
		    onRequestClose={this.state.notificationOnRequestClose}
		/>
	    </div>
	    </DocumentTitle>
	);
    }
}));

export default Kids;
