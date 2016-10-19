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
import ActionDelete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import seedrandom from 'seedrandom';
import FlipMove from 'react-flip-move';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {white} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';


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
	return {data: [], snackOpen: false};
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
		    this.setState({data: data});
		    if (this.props.instructor && len < this.state.data.length) {
			this.refs.notify.play();
		    }
		    this.updateDocumentTitle();
		}
		setTimeout(this.loadKidsFromServer, 2000);
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		setTimeout(this.loadKidsFromServer, 2000, force);
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
		this.setState({data: data});
		this.updateDocumentTitle();
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
		this.setState({data: data});
		this.updateDocumentTitle();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (status == 404) {
		    setTimeout(this.handleKidSubmit, 2000, kid);
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
		this.setState({data: data});
		this.updateDocumentTitle();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (status == 404) {
		    setTimeout(this.handleKidDelete, 2000, kid);
		}
	    }.bind(this)
	});
    },
    handleSnackRequestClose: function() {
	this.setState({snackOpen: false});
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
		    <KidsList data={this.state.data}
			      onKidSubmit={this.handleKidSubmit}
			      onKidDelete={this.handleKidDelete}
			      onKidAnswer={this.handleKidSubmit}
			      username={this.props.username}
			      instructor={this.props.instructor}
		    />
		<audio ref="notify">
		<source src="/notify.wav" type="audio/wav"/>
		</audio>

		<Snackbar
		    open={false}
		    message="Kid removed from queue"
		    action="undo"
		    autoHideDuration={4000}
		    onActionTouchTap={null}
		    onRequestClose={this.handleSnackRequestClose}
		/>
	    </div>
	);
    }
});

var QClass = React.createClass({
    getInitialState: function() {
	return {queues: {},
		open: false,
		instructor: false,
		addingQueue: false,
		name: "",
	};
    },
    handleNestedListToggle: function(item) {
	if (item.state.open) {
	    this.loadQueuesFromServer();
	}
    },
    handleNameChange: function(e) {
	this.setState({name: e.target.value});
    },
    handleOpen: function() {
	this.setState({addingQueue: true});
    },
    handleClose: function() {
	this.setState({addingQueue: false});
	this.setState({name: ""});
    },
    handleAddQueue: function(name) {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({name: name}),
	    success: function(data) {
		this.setState({instructor: true});
		this.setState({queues: data});
		this.handleClose();
		var ids = Object.keys(data);
		var queueId = ids[ids.length - 1]
		this.props.onSelectQueue(queueId, data[queueId]);
	    }.bind(this),
	    error: function(xhr, status, err) {
		if (status = 403) {
		    this.setState({instructor: false});
		}
	    }.bind(this)
	});
    },
    handleDeleteQueue: function(queueId) {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'DELETE',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({id: queueId}),
	    success: function(data) {
		this.setState({queues: data});
		this.handleClose();
		this.props.onSelectQueue(0, "q.cs");
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    loadQueuesFromServer: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'GET',
	    cache: false,
	    success: function(data) {
		this.setState({queues: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    componentDidMount: function() {
	this.loadQueuesFromServer();
	this.handleAddQueue("");
    },
    render: function() {
	var queueNodes = Object.keys(this.state.queues).map(function (queueId) {
	    return (
		<ListItem primaryText={this.state.queues[queueId]}
			  key={queueId}
			  onTouchTap={function () {
				  this.props.onSelectQueue(queueId, this.state.queues[queueId])
			      }.bind(this)}
			  rightIconButton={<IconButton tooltip="Delete queue">
						<ActionDelete onTouchTap={function () {this.handleDeleteQueue(queueId)}.bind(this)}/>
					  </IconButton>}
		/>
	    );
	}.bind(this));
	
	if (this.state.instructor) {
	    queueNodes.push(<ListItem primaryText="New Queue"
				      key="0"
				      onTouchTap={this.handleOpen}
				      leftIcon={<ContentAdd />}
			    />);
	}

	const actions = [
	    <FlatButton
		label="Cancel"
		primary={true}
		onTouchTap={this.handleClose}
	    />,
	    <FlatButton
		label="Save"
		primary={true}
		onTouchTap={function () {this.handleAddQueue(this.state.name);}.bind(this)}
	    />,
	];
	
	return (
	    <div>
	    <ListItem primaryText={this.props.name}
		      key={this.props.classId}
		      primaryTogglesNestedList={true}
		      nestedItems={queueNodes}
		      onNestedListToggle={this.handleNestedListToggle}
	    />
	    
	    {(!this.state.addingQueue) ? null :
		<Dialog
		    title="Name"
		    actions={actions}
		    modal={false}
		    open={this.state.addingQueue}
		    onRequestClose={this.handleClose}
		>
		    <TextField
			hintText="Queue name"
			value={this.state.name}
			onChange={this.handleNameChange}
			autoFocus={true}
		    />
		</Dialog>
	    }
	    </div>
	);
    }
});

var ClassList = React.createClass({
    render: function() {
	var classNodes = Object.keys(this.props.classes).map(function (classId) {
	    return (
		<QClass classId={classId}
			key={classId}
			name={this.props.classes[classId]}
			onSelectQueue={this.props.onSelectQueue}
			url={this.props.url + classId}
		/>
	    );
	}.bind(this));
	return (
	    <List>
		<Subheader>Classes</Subheader>
		{classNodes}
	    </List>
	);
    }
});

var QDrawer = React.createClass({
    handleRequestChange: function(open, reason) {
	if (!open) {
	    this.props.onRequestChange();
	}
    },
    render: function() {
	return (
	    <div>
		<Drawer open={this.props.open} docked={false} onRequestChange={this.handleRequestChange}>
		    <AppBar title="q.cs" showMenuIconButton={false}/>
		    <ClassList classes={this.props.classes}
			       onSelectQueue={this.props.onSelectQueue}
			       url={this.props.url}
		    />
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
	return {name: '', room: '', question:'', expanded:false};
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
	this.setState({name: '', room: '', question:''});
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
		<CardHeader
		    title={this.props.name + " - " + this.props.room}
		    subtitle={this.props.question}
		    avatar={<Avatar backgroundColor={this.generateColor()} onTouchTap={this.props.instructor ? this.handleTouchTap : undefined}>{this.props.name[0]} </Avatar>}
		>
		    {this.props.answer ? <CircularProgress size={0.5} style={styles.done}/> : null}
		    {this.props.instructor || this.props.username == this.props.id ?
		     (
			 <IconButton
			     style={styles.done}
			     onTouchTap={this.handleButtonTouchTap}>
			     <ActionDone/>
			 </IconButton>
		     ) : null}
		</CardHeader>
	    </Card>
	);
    }
})

var QAppBarMenu = React.createClass({
    render: function () {
	return (
	    <IconMenu iconButtonElement={<IconButton><MoreVertIcon color={white}/></IconButton>}
		      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
		      targetOrigin={{horizontal: 'right', vertical: 'top'}}
	    >
		<MenuItem primaryText="Refresh" onTouchTap={this.props.onRefresh}/>
		<MenuItem primaryText="Log out"
			  onTouchTap={this.props.onLogout}
		/>
	    </IconMenu>
	);
    }
});

var QAppBar = React.createClass({
    render: function () {
	return (
	    <AppBar
		title={this.props.queueName}
		onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
		iconElementRight={<QAppBarMenu onLogout={this.props.onLogout} onRefresh={this.props.onRefresh}/>}
	    />
	);
    }
});

const AddButton = () => (
    <FloatingActionButton secondary={true} style={styles.addButton}>
	<ContentAdd />
    </FloatingActionButton>
);


var FakeAuthDialog = React.createClass({
    getInitialState: function() {
	return {username: "", open: true};
    },
    handleChange: function(e) {
	this.setState({
	    username: e.target.value,
	});
    },
    handleLogin: function() {
	this.props.onLogin({username: this.state.username});
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
		title="Fake Login"
		actions={actions}
		modal={true}
		open={this.state.open}
            >
		<TextField
		    hintText="NetID"
		    errorText={this.state.username ? "" : "This field is required"}
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
		if (status == 404) {
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
			 />

			 {__FAKEAUTH__ && !this.state.username ?
			  <FakeAuthDialog onLogin={this.handleLogin} /> : null}

			 {this.state.queueId == 0 ? null : 
			  <Kids url={this.props.queue_url + this.state.queueId}
				baseTitle={this.state.queueName}
				queueId={this.state.queueId}
				instructor={this.state.queueInstructor}
				username={this.state.username}
				refresh={this.state.refresh}
			  />}
			  
		     </div>) : <LoggedOut />}
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <App class_url="/classes"
	 queue_url="/queue/"
	 queues_url="/class/"
	 login_url="/auth"
    />,
    document.getElementById('app')
);
