import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import $ from 'jquery';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ActionDone from 'material-ui/svg-icons/action/done';
import IconButton from 'material-ui/IconButton';
import seedrandom from 'seedrandom';
import FlipMove from 'react-flip-move';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';

injectTapEventPlugin();

var material_palette = require("!json!./material_palette.json")
var testdata = [
    {
	"name":"Flora",
	"room": "216",
	"question": "Mp4",
	"id": "f19"
    },
    {
	"name":"Thomas",
	"room": "218",
	"question": "Lab 2",
	"id": "t2"
    },
    {
	"name":"Dummy",
	"room": "Lost",
	"question": "sldksd",
	"id": "dum21"
    }
]

var styles = {
    addButton: {
	marginRight: 20,
	marginBottom: 20,
	bottom: 0,
	right: 0,
	position: 'absolute'
    },
    done: {
	right: 0,
	position: 'absolute'
    },
    container: {
	marginLeft: "25%",
	marginRight: "25%",
	marginTop: "5%",
	marginBottom: "5%"
    },
    containerMobile: {
	margin: 0
    }   
}

var Kids = React.createClass({
    getInitialState: function() {
	return {data: testdata, undoData: [], password:"", snackOpen: false};
    },
    loadKidsFromServer: function(force) {
	var len = this.state.data.length;

	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    data: force ? {force: force} : {},
	    success: function(data) {
		this.setState({data: data});
		if (this.state.password && len < this.state.data.length) {
		    this.refs.notify.play();
		}
		this.updateDocumentTitle();
		setTimeout(this.loadKidsFromServer, 2000);
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		setTimeout(this.loadKidsFromServer, 2000, force);
	    }.bind(this)
	});
    },
    handleKidSubmit: function(kid) {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'POST',
	    data: kid,
	    success: function(data) {
		this.setState({data: data});
		this.updateDocumentTitle();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		setTimeout(this.handleKidSubmit, 2000, kid);
	    }.bind(this)
	});
    },
    handleKidDelete: function(kid) {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'DELETE',
	    data: {id: kid.id, password: this.state.password},
	    success: function(data) {
		this.setState({undoData: this.state.data.slice(0), snackOpen: true});
		this.setState({data: data});
		this.updateDocumentTitle();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		setTimeout(this.handleKidDelete, 2000, kid);
	    }.bind(this)
	});
    },
    handleUndo: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'PUT',
	    data: {data: JSON.stringify(this.state.undoData), password: this.state.password},
	    success: function(data) {
		this.setState({data: data, snackOpen: false});
		this.updateDocumentTitle();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    handleSnackRequestClose: function() {
	this.setState({snackOpen: false});
    },
    handlePasswordChange: function(text) {
	this.setState({password: text});
    },
    componentDidMount: function() {
	this.loadKidsFromServer(true);
	this.updateDocumentTitle();
    },
    updateDocumentTitle: function() {
	var len = this.state.data.length;
	document.title = len > 1 ? "".concat("(", len.toString(), ") ", this.props.baseTitle) : this.props.baseTitle;
    },
    render: function() {
	return (
	    <div className="Kids">
		<QDrawer
		    open={this.props.open}
		    onRequestChange={this.props.onRequestChange}
		    password={this.state.password}
		    onPasswordChange={this.handlePasswordChange}
		/>
		<KidsList data={this.state.data} onKidSubmit={this.handleKidSubmit} onKidDelete={this.handleKidDelete} onKidAnswer={this.handleKidSubmit} password={this.state.password}/>
		<audio ref="notify">
		    <source src="/notify.wav" type="audio/wav"/>
		</audio>

		<Snackbar
		    open={false}
		    message="Kid removed from queue"
		    action="undo"
		    autoHideDuration={4000}
		    onActionTouchTap={this.handleUndo}
		    onRequestClose={this.handleSnackRequestClose}
		/>
	    </div>
	);
    }
});

var QDrawer = React.createClass({
    handleRequestChange: function(open, reason) {
	if (!open) {
	    this.props.onRequestChange();
	}
    },
    handlePasswordChange: function(e) {
	this.props.onPasswordChange(e.target.value);
    },
    render: function() {
	return (
	    <div>
		<Drawer open={this.props.open} docked={false} onRequestChange={this.handleRequestChange}>
		    <TextField
			hintText="Instructor Password"
			value={this.props.password}
			onChange={this.handlePasswordChange}
		    />
		    {/* <MenuItem>Join as Instructor</MenuItem> */}
		</Drawer>
	    </div>
	);
    }
});

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
		     password={this.props.password}
		     onKidDelete={this.props.onKidDelete}
		     onKidAnswer={this.props.onKidAnswer}
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
	return {name: '', room: '', question:'', id:'', expanded:false};
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
    handleIdChange: function(e) {
	this.setState({id: e.target.value});
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
	    id: this.state.id.trim()
	});
	this.setState({name: '', room: '', question:'', id:''});
	this.reduce();
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
			errorText={this.state.name ? "" : "This field is required"}
			value={this.state.name}
			onChange={this.handleNameChange}
			autoFocus={true}
		    />
		    <br/>
		    <TextField
			hintText="Room"
			errorText={this.state.room ? "" : "This field is required"}
			value={this.state.room}
			onChange={this.handleRoomChange}
		    />
		    <br/>
		    <TextField
			hintText="Question"
			errorText={this.state.question ? "" : "This field is required"}
			value={this.state.question}
			onChange={this.handleQuestionChange}
		    />
		    <br/>
		    <TextField
			hintText="NetID"
			errorText={this.state.id ? "" : "This field is required"}
			value={this.state.id}
			onChange={this.handleIdChange}
		    />
		    <br/>
		    <CardActions>
			<FlatButton
			    label="Submit" disabled={!(this.state.name && this.state.room && this.state.question && this.state.id)}
			    onTouchTap={this.submitKid}
			/>
		    </CardActions>
		</CardText>
	    </Card>
	);
    }
});

var Kid = React.createClass({
    handleButtonTouchTap: function(e) {
	this.props.onKidDelete({id: this.props.id});
    },
    handleTouchTap: function(e) {
	this.props.onKidAnswer({id: this.props.id,
				name: this.props.name,
				room: this.props.room,
				question: this.props.question,
				answer: !this.props.answer,
				password: this.props.password});
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
		<CardHeader
		    title={this.props.name + " - " + this.props.room}
		    subtitle={this.props.question}
		    avatar={<Avatar backgroundColor={this.generateColor()} onTouchTap={this.props.password ? this.handleTouchTap : undefined}>{this.props.name[0]} </Avatar>}
		>
		    {this.props.answer ? <CircularProgress size={0.5} style={styles.done}/> : null}
		    <IconButton disabled={!this.props.password} style={styles.done} onTouchTap={this.handleButtonTouchTap}>
			<ActionDone/>
		    </IconButton>
		</CardHeader>
	    </Card>
	);
    }
})

var QAppBar = React.createClass({
    render: function () {
	return (
	    <AppBar
		title="q.cs"
		onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
	    />
	);
    }
});

const AddButton = () => (
    <FloatingActionButton secondary={true} style={styles.addButton}>
	<ContentAdd />
    </FloatingActionButton>
);

var App = React.createClass({
    getInitialState: function() {
	return {open:false, queueName: "CS 233"};
    },
    handleLeftIconButtonTouchTap: function (e) {
	this.setState({open: !this.state.open});
    },
    render: function() {
	return(
	    <MuiThemeProvider>
		<div>
		    <QAppBar onLeftIconButtonTouchTap={this.handleLeftIconButtonTouchTap}/>
		    <Kids url={this.props.url} open={this.state.open} onRequestChange={this.handleLeftIconButtonTouchTap} baseTitle={this.state.queueName}/>
		</div>
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <App url="/queue/1" />,
    document.getElementById('app')
);
