import React from 'react';
import $ from 'jquery';
import {ListItem} from 'material-ui/List';
import ActionAnnouncement from 'material-ui/svg-icons/action/announcement';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

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

export default AnnounceButton;
