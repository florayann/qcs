import React from 'react';
import AppBar from 'material-ui/AppBar';
import $ from 'jquery';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Drawer from 'material-ui/Drawer';
import ActionDone from 'material-ui/svg-icons/action/done';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionClass from 'material-ui/svg-icons/action/class';
import ActionToc from 'material-ui/svg-icons/action/toc';
import IconButton from 'material-ui/IconButton';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Dialog from 'material-ui/Dialog';

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
	    this.handleAddQueue("");
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
		if (name) {
		    var ids = Object.keys(data);
		    var queueId = ids[ids.length - 1];
		    this.props.onSelectQueue(queueId, data[queueId]);
		}
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
		if (this.props.drawerOpen) {
		    setTimeout(this.loadQueuesFromServer, 10000);
		}
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    componentWillReceiveProps: function(nextProps) {
	if ((nextProps.drawerOpen != this.props.drawerOpen) &&
	    (nextProps.drawerOpen)) {
	    this.loadQueuesFromServer();
	}
    },
    componentDidMount: function() {
	this.loadQueuesFromServer();
    },
    handleKeyPress: function(target) {
	if (target.charCode == 13) {
	    this.handleAddQueue(this.state.name);
	}
    },
    render: function() {
	var queueNodes = Object.keys(this.state.queues).map(function (queueId) {
	    return (
		<ListItem primaryText={this.state.queues[queueId]}
			  key={queueId}
			  onTouchTap={function () {
				  this.props.onSelectQueue(queueId, this.state.queues[queueId])
			      }.bind(this)}
			  leftIcon={<ActionToc />}
			  rightIconButton={this.state.instructor ?
					   <IconButton tooltip="Delete queue">
						<ActionDelete onTouchTap={function () {this.handleDeleteQueue(queueId)}.bind(this)}/>
					  </IconButton> : null}
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
		      leftIcon={<ActionClass />}
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
			onKeyPress={this.handleKeyPress}
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
			drawerOpen={this.props.drawerOpen}
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
			       drawerOpen={this.props.open}
		    />
		</Drawer>
	    </div>
	);
    }
});


export default QDrawer;