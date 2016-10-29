import React from 'react';
import $ from 'jquery';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionClass from 'material-ui/svg-icons/action/class';
import ActionToc from 'material-ui/svg-icons/action/toc';
import IconButton from 'material-ui/IconButton';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Dialog from 'material-ui/Dialog';


class DeleteQueueDialog extends React.Component {
    render() {
	const actions = [
	    <FlatButton
		label="Cancel"
		primary={false}
		onTouchTap={this.props.onClose}
	    />,
	    <FlatButton
		label="Confirm"
		primary={true}
		onTouchTap={this.props.onConfirmDelete}
	    />,
	];

	return (
	    <Dialog
		title={`Delete ${this.props.name}?`}
		actions={actions}
		modal={false}
		open={this.props.deletingQueue}
		onRequestClose={this.props.onClose}
	    >
	    </Dialog>
	);
    }
}


class AddQueueDialog extends React.Component {
    static propTypes = {
	onClose: React.PropTypes.func.isRequired,
	onSubmit: React.PropTypes.func.isRequired,
	onNameChange: React.PropTypes.func.isRequired,
	onKeyPress: React.PropTypes.func.isRequired,
	addingQueue: React.PropTypes.bool.isRequired,
	name: React.PropTypes.string.isRequired,
    }

    render() {
	const actions = [
	    <FlatButton
		label="Cancel"
		primary={false}
		onTouchTap={this.props.onClose}
	    />,
	    <FlatButton
		label="Save"
		primary={true}
		onTouchTap={() => {this.props.onSubmit(this.props.name);}}
	    />,
	];
	
	return (
	    <Dialog
		title="Name"
		actions={actions}
		modal={false}
		open={this.props.addingQueue}
		onRequestClose={this.props.onClose}
	    >
		<TextField
		    hintText="Queue name"
		    value={this.props.name}
		    onChange={this.props.onNameChange}
		    autoFocus={true}
		    onKeyPress={this.props.onKeyPress}
		/>
	    </Dialog>
	)
    }
    
}


var QClass = React.createClass({
    getInitialState: function() {
	return {queues: {},
		open: false,
		instructor: false,
		addingQueue: false,
		deletingQueue: false,
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
    handleAddClose: function() {
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
		this.handleAddClose();
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
    handleDeleteQueue: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'DELETE',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({id: this.state.deletedQueue}),
	    success: function(data) {
		this.setState({queues: data});
		this.closeDelete();
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
	this.handleAddQueue("");
    },
    handleKeyPress: function(target) {
	if (target.charCode == 13) {
	    this.handleAddQueue(this.state.name);
	}
    },
    confirmDelete: function(queueId) {
	this.setState({deletingQueue: true,
		       deletedQueue: queueId,
	});
    },
    closeDelete: function() {
	this.setState({deletingQueue: false,
		       deletedQueue: null,
	});
    },
    render: function() {
	var queueNodes = Object.keys(this.state.queues).map((queueId) => {
	    return (
		<ListItem primaryText={this.state.queues[queueId]}
			  key={queueId}
			  onTouchTap={() => {
				  this.props.onSelectQueue(queueId,
							   this.state.queues[queueId])
			      }}
			  leftIcon={<ActionToc />}
			  rightIconButton=
			  {this.state.instructor ?
			   <IconButton onTouchTap={() => {
				   this.confirmDelete(queueId);
			       }}
			   >
			       <ActionDelete />
			   </IconButton> :
			   null}
		/>
	    );
	});
	
	if (this.state.instructor) {
	    queueNodes.push(<ListItem primaryText="New Queue"
				      key="0"
				      onTouchTap={this.handleOpen}
				      leftIcon={<ContentAdd />}
			    />);
	}
	
	return (
	    <div>
		<ListItem primaryText={this.props.name}
			  key={this.props.classId}
			  primaryTogglesNestedList={true}
			  nestedItems={queueNodes}
			  onNestedListToggle={this.handleNestedListToggle}
			  leftIcon={<ActionClass />}
		/>

		<DeleteQueueDialog deletingQueue={this.state.deletingQueue}
				   onConfirmDelete={this.handleDeleteQueue}
				   name={this.state.queues[this.state.deletedQueue]}
				   onClose={this.closeDelete}
		/>

		<AddQueueDialog addingQueue={this.state.addingQueue}
				onSubmit={this.handleAddQueue}
				onClose={this.handleAddClose}
				onNameChange={this.handleNameChange}
				onKeyPress={this.handleKeyPress}
				name={this.state.name}
		/>
	    </div>
	);
    }
});

export default QClass;
