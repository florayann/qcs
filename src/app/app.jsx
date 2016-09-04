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

injectTapEventPlugin();

var styles = {
    addButton: {
	marginRight: 20,
	marginBottom: 20,
	bottom: 0,
	right: 0,
	position: 'absolute'
    }
}

var Kids = React.createClass({
    getInitialState: function() {
	return {data: [], password:""};
    },
    loadKidsFromServer: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    success: function(data) {
		this.setState({data: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
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
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
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
		this.setState({data: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    handlePasswordChange: function(text) {
	this.setState({password: text});
    },
    componentDidMount: function() {
	this.loadKidsFromServer();
	setInterval(this.loadKidsFromServer, 2000);
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
		<KidsList data={this.state.data} onKidSubmit={this.handleKidSubmit}/>
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
    render: function() {
	var kidsNodes = this.props.data.map(function(kid) {
	    return (
		<Kid name={kid.name} room={kid.room} question={kid.question} key={kid.id} />
	    );
	});
	return (
	    <div className="kidsList">
		{kidsNodes}
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
	this.setState({expanded: expanded})
    },
    reduce: function() {
	this.setState({expanded: false})
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
		/>
		<CardText expandable={true}>
		    <TextField
			hintText="Name"
			errorText={this.state.name ? "" : "This field is required"}
			value={this.state.name}
			onChange={this.handleNameChange}
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
    render: function() {
	return (
	    <Card>
		<CardHeader
		    title={this.props.name + " - " + this.props.room}
		    subtitle={this.props.question}
		    avatar={<Avatar>{this.props.name[0]}</Avatar>}
		/>
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
	return {open:false};
    },
    handleLeftIconButtonTouchTap: function (e) {
	this.setState({open: !this.state.open});
    },
    render: function() {
	return(
	    <MuiThemeProvider>
		<div>
		    <QAppBar onLeftIconButtonTouchTap={this.handleLeftIconButtonTouchTap}/>
		    <Kids url={this.props.url} open={this.state.open} onRequestChange={this.handleLeftIconButtonTouchTap}/>
		</div>
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <App url="/hello" />,
    document.getElementById('app')
);
