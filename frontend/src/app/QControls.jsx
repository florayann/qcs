import React from 'react';
import $ from 'jquery';
import {List, ListItem} from 'material-ui/List';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import PauseArrow from 'material-ui/svg-icons/av/pause';
import ActionAnnouncement from 'material-ui/svg-icons/action/announcement';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

var PlayPauseButton = React.createClass({
    render: function() {
	return (
	    <ListItem primaryText={this.props.paused ? "Resume" : "Pause"}
		      onTouchTap={this.props.onPauseToggle}
		      leftIcon={this.props.paused ? <PlayArrow /> : <PauseArrow />}
	    />
	);
    }
});

var AnnounceButton = React.createClass({
    getInitialState: function() {
	return {announcing: false,
		message: "",
	};
    },
    handleOpen: function() {
	this.setState({announcing: true});
    },
    handleClose: function() {
	this.setState({announcing: false, message: ""});
    },
    handleMessageChange: function(e) {
	this.setState({message: e.target.value});
    },
    handleKeyPress: function(target) {
	if (target.charCode == 13) {
            this.handleAddAnnouncement();
	}
    },
    handleAddAnnouncement: function() {
	$.ajax({
	    url: "/instructor" + this.props.url,
	    dataType: 'json',
	    type: 'PUT',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({message: this.state.message}),
	    success: function(data) {
		this.handleClose();
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    render: function() {
	const actions = [
	    <FlatButton
		label="Cancel"
		primary={false}
		onTouchTap={this.handleClose}
	    />,
	    <FlatButton
		label="Save"
		primary={true}
		onTouchTap={this.handleAddAnnouncement}
	    />,
	];
	return (
	    <div>
		<ListItem primaryText={"Announce"}
			  onTouchTap={this.handleOpen}
			  leftIcon={<ActionAnnouncement />}
		/>
		<Dialog
		    title="Announcement"
		    actions={actions}
		    modal={false}
		    open={this.state.announcing}
		    onRequestClose={this.handleClose}
		>
		    <TextField
			hintText="Message to the queue"
			value={this.state.message}
			onChange={this.handleMessageChange}
			autoFocus={true}
			onKeyPress={this.handleKeyPress}
/>
		</Dialog>
	    </div>
	);
    }
});

var QControls = React.createClass({
    getInitialState: function() {
	return {
	    paused: false,
	};
    },
    handlePauseToggle: function() {
	var requestType = this.state.paused ? 'POST' : 'DELETE';

	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: requestType,
	    success: function(data) {
		this.setState({paused: data.paused});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    loadQueueInfo: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'GET',
	    cache: false,
	    success: function(data) {
		this.setState({paused: data.paused});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    componentDidMount: function() {
	this.loadQueueInfo();
    },
    render: function() {
	return (
	    <div>
		<Divider />
		<Subheader>Queue</Subheader>
		<List>
		    <PlayPauseButton paused={this.state.paused}
				     onPauseToggle={this.handlePauseToggle}
		    />
		    <AnnounceButton url={this.props.queue_url}/>
		</List>
	    </div>
	);
    }
});

export default QControls;
