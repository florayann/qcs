import React from 'react';
import $ from 'jquery';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionClass from 'material-ui/svg-icons/action/class';
import ActionToc from 'material-ui/svg-icons/action/toc';
import IconButton from 'material-ui/IconButton';
import {ListItem} from 'material-ui/List';
import Dialog from 'material-ui/Dialog';


class DeleteQueueDialog extends React.Component {
    static propTypes = {
	onClose: React.PropTypes.func.isRequired,
	onConfirmDelete: React.PropTypes.func.isRequired,
	deletingQueue: React.PropTypes.bool.isRequired,
	name: React.PropTypes.string,
    }

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
	    />
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
	name: React.PropTypes.string,
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
		onTouchTap={() => {
			this.props.onSubmit(this.props.name);
		    }}
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
	);
    }

}


class QClass extends React.Component {
    static propTypes = {
	onSelectQueue: React.PropTypes.func.isRequired,
	drawerOpen: React.PropTypes.bool.isRequired,
	url: React.PropTypes.string.isRequired,
	name: React.PropTypes.string,
	classId: React.PropTypes.string.isRequired,
    }

    state = {queues: {},
	     open: false,
	     instructor: false,
	     addingQueue: false,
	     deletingQueue: false,
	     name: "",
    };

    constructor(props) {
	super(props);
	this.loadQueuesFromServer();
	this.handleAddQueue("");
    }

    componentDidUpdate(prevProps) {
	if ((prevProps.drawerOpen !== this.props.drawerOpen) &&
	    (this.props.drawerOpen)) {
	    this.loadQueuesFromServer();
	}
    }

    handleNestedListToggle = (item) => {
	if (item.state.open) {
	    this.handleAddQueue("");
	}
    }

    handleNameChange = (e) => {
	this.setState({name: e.target.value});
    }

    handleOpen = () => {
	this.setState({addingQueue: true});
    }

    handleAddClose = () => {
	this.setState({addingQueue: false});
	this.setState({name: ""});
    }

    handleAddQueue = (name) => {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({name: name}),
	    success: (data) => {
		this.setState({instructor: true});
		this.setState({queues: data});
		this.handleAddClose();
		if (name) {
		    let ids = Object.keys(data);
		    let queueId = ids[ids.length - 1];
		    this.props.onSelectQueue(queueId, data[queueId]);
		}
	    },
	    error: (xhr, status, err) => {
		if (xhr.status === 403) {
		    this.setState({instructor: false});
		}
	    },
	});
    }

    handleDeleteQueue = () => {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'DELETE',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({id: this.state.deletedQueue}),
	    success: (data) => {
		this.setState({queues: data});
		this.closeDelete();
	    },
	});
    }

    loadQueuesFromServer = () => {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'GET',
	    cache: false,
	    success: (data) => {
		this.setState({queues: data});
		if (this.props.drawerOpen) {
		    setTimeout(this.loadQueuesFromServer, 10000);
		}
	    },
	});
    }

    handleKeyPress = (target) => {
	if (target.charCode === 13) {
	    this.handleAddQueue(this.state.name);
	}
    }

    confirmDelete = (queueId) => {
	this.setState({deletingQueue: true,
		       deletedQueue: queueId,
	});
    }

    closeDelete = () => {
	this.setState({deletingQueue: false,
		       deletedQueue: null,
	});
    }

    render() {
	var queueNodes = Object.keys(this.state.queues).map((queueId) => {
	    return (
		<ListItem primaryText={this.state.queues[queueId]}
			  key={queueId}
			  onTouchTap={() => {
				  this.props.onSelectQueue(queueId,
							   this.state.queues[queueId]);
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
}


export default QClass;
