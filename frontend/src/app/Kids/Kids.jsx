import React from 'react';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Snackbar from 'material-ui/Snackbar';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import ReactTimeout from 'react-timeout';
import DocumentTitle from 'react-document-title';
import _ from 'underscore';
import $ from 'jquery';

import styles from '../styles';
import KidsList from './KidsList';

var Kids = ReactTimeout(React.createClass({
    getInitialState: function() {
	return {data: [],
		timestamps: [],
		rev: 0,
		announcement: null,
		snackOpen: false,
		deletedKid: null,
		paused: false,
		notificationOpen: false,
		notificationMessage: "Notification",
		loadKidsTimerId: 0,
		pendingXhr: null,
		adding: false,
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
	this.props.clearTimeout(this.state[timerIdProperty]);

	var timerId = this.props.setTimeout(...rest);
	
	this.setState({
	    [timerIdProperty]: timerId,
	});

	return timerId;
    },
    updateQueue: function(data) {
	var queue = data.queue;
	queue.map(function(kid, index) {
	    _.extend(kid, {timestamp: data.timestamps[index]});
	}.bind(this));
	queue = this.rejectDeletedKid(data.queue);
	this.setState({data: queue,
		       timestamps: data.timestamps,
		       announcement: data.announcement,
		       paused: data.paused,
		       rev: data.rev,
	});
    },
    loadKidsFromServer: function(rev=this.state.rev) {
	var len = this.state.data.length;
	var oldUrl = this.props.url;
	var timerId = this.state.loadKidsTimerId;

	if (this.state.pendingXhr) {
	    this.state.pendingXhr.abort();
	}

	var xhr =
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    data: {rev: rev},
	    success: function(data) {
		this.setState({pendingXhr: null});
		if (oldUrl == this.props.url) {
		    this.updateQueue(data);
		    if (this.props.instructor && len < this.state.data.length) {
			this.refs.notify.play();
		    }
		    /* If nobody touched the timer before I get back, I will reset it */
		    if (timerId == this.state.loadKidsTimerId) {
			this.clearAndSetTimeout("loadKidsTimerId",
						this.loadKidsFromServer,
						0);
		    }
		}
	    }.bind(this),
	    error: function(xhr, status, err) {
		this.setState({pendingXhr: null});
		console.error(this.props.url, status, err.toString());
		if (xhr.status != 410) {
		    if (this.state.loadKidsTimerId == timerId) {
			this.clearAndSetTimeout("loadKidsTimerId",
						this.loadKidsFromServer,
						2000,
						rev);
		    }
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
	this.setState({pendingXhr: xhr});
    },
    refreshKidsFromServer: function(props=this.props) {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    data: {rev: 0},
	    success: function(data) {
		this.updateQueue(data);
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
	/* Touching the timer will prevent returning requests from setting another */
	this.clearAndSetTimeout("loadKidsTimerId",
				this.loadKidsFromServer,
				0,
				0,
	)
    },
    componentDidUpdate: function(prevProps, prevState) {
	if ((prevProps.refresh != this.props.refresh) ||
	    (prevProps.url != this.props.url)) {
	    this.refreshKidsFromServer();
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
		this.updateQueue(data);
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
		    this.displayNotification("Submission has been disabled", 2000);
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
		this.setState({deletedKid: null});
		this.updateQueue(data);
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
    handleRemoveAnnouncement: function() {
	$.ajax({
	    url: "/instructor" + this.props.url,
	    dataType: 'json',
	    type: 'PUT',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({message: ""}),
	    success: function(data) {
		this.updateQueue(data);
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    this.clearAndSetTimeout("removeAnnouncementTimerId",
					    this.handleRemoveAnnouncement,
					    2000,
					    );
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
    handleWindowClose: function(e) {
	if (this.state.deletedKid) {
	    this.deleteKid();
	}
    },
    componentDidMount: function() {
	this.loadKidsFromServer();
	window.addEventListener("beforeunload",
				this.handleWindowClose
	);
    },
    componentWillUnmount: function() {
	window.removeEventListener("beforeunload", this.handleWindowClose);
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
    isEditing: function() {
	return _.contains(_.pluck(this.state.data, "id"), this.props.username);
    },
    handleAddExpandChange: function(expanded) {
	this.setState({adding: !this.state.paused && expanded});
    },
    handleAddOpen: function() {
	this.setState({adding: true});
    },
    handleAddReduceChange: function() {
	this.setState({adding: false});
    },
    render: function() {
	return (
	    <DocumentTitle title={this.getDocumentTitle()}>
	    <div className="Kids">
		<KidsList data={this.state.data}
			  onKidSubmit={this.handleKidSubmit}
			  onKidDelete={this.tentativeKidDelete}
			  onKidAnswer={this.handleKidSubmit}
			  onRemoveAnnouncement={this.handleRemoveAnnouncement}
			  username={this.props.username}
			  instructor={this.props.instructor}
			  editing={this.isEditing()}
			  announcement={this.state.announcement}
			  paused={this.state.paused}
			  adding={this.state.adding}
			  onAddExpandChange={this.handleAddExpandChange}
			  onAddReduceChange={this.handleAddReduceChange}
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

		<FloatingActionButton
		    secondary={true}
		    style={styles.addButton}
		    onTouchTap={this.handleAddOpen}
		    disabled={this.state.paused}
		>
		    <ContentAdd />
		</FloatingActionButton>
	    </div>
	    </DocumentTitle>
	);
    }
}));

export default Kids;
