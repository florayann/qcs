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

class PlayPauseButton extends React.Component {
    static propTypes = {
	paused: React.PropTypes.bool.isRequired,
	onPauseToggle: React.PropTypes.func.isRequired,
    }

    render() {
	return (
	    <ListItem primaryText={this.props.paused ? "Resume" : "Pause"}
		      onTouchTap={this.props.onPauseToggle}
		      leftIcon={this.props.paused ? <PlayArrow /> : <PauseArrow />}
	    />
	);
    }
}

class AnnounceButton extends React.Component {
    static propTypes = {
	url: React.PropTypes.string.isRequired,
    }

    state = {
	announcing: false,
	message: "",
    }

    handleOpen = () => {
	this.setState({announcing: true});
    }

    handleClose = () => {
	this.setState({announcing: false, message: ""});
    }

    handleMessageChange = (e) => {
	this.setState({message: e.target.value});
    }

    handleKeyPress = (target) => {
	if (target.charCode === 13) {
            this.handleAddAnnouncement();
	}
    }

    handleAddAnnouncement = () => {
	$.ajax({
	    url: "/instructor" + this.props.url,
	    dataType: 'json',
	    type: 'PUT',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({message: this.state.message}),
	    success: (data) => {
		this.handleClose();
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
	    },
	});
    }

    render() {
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
}

class QControls extends React.Component {
    static propTypes = {
	url: React.PropTypes.string.isRequired,
	queue_url: React.PropTypes.string.isRequired,
    }

    state = {
	paused: false,
    }

    componentDidMount() {
	this.loadQueueInfo();
    }

    handlePauseToggle = () => {
	var requestType = this.state.paused ? 'POST' : 'DELETE';

	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: requestType,
	    success: (data) => {
		this.setState({paused: data.paused});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
	    },
	});
    }

    loadQueueInfo = () => {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    type: 'GET',
	    cache: false,
	    success: (data) => {
		this.setState({paused: data.paused});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
	    },
	});
    }

    render() {
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
}

export default QControls;
