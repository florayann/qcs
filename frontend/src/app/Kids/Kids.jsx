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

class Kids extends React.Component {
    state = {
	data: [],
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

    }

    componentDidUpdate(prevProps, prevState) {
	if ((prevProps.refresh !== this.props.refresh) ||
	    (prevProps.url !== this.props.url)) {
	    this.refreshKidsFromServer();
	}
    }

    componentDidMount() {
	this.loadKidsFromServer();
	window.addEventListener("beforeunload",
				this.handleWindowClose
	);
    }

    componentWillUnmount() {
	window.removeEventListener("beforeunload", this.handleWindowClose);
    }

    hasSameId = (kid, other) => {
	return kid.id == other.id;
    }

    rejectDeletedKid = (data, deletedKid=this.state.deletedKid) => {
	if (deletedKid) {
	    return _.reject(data, (kid) => {
		return this.hasSameId(kid, deletedKid);
	    });
	}
	return data;
    }

    clearAndSetTimeout = (timerIdProperty, ...rest) => {
	this.props.clearTimeout(this.state[timerIdProperty]);

	var timerId = this.props.setTimeout(...rest);

	this.setState({
	    [timerIdProperty]: timerId,
	});

	return timerId;
    }

    updateQueue = (data) => {
	var queue = data.queue;
	queue.map((kid, index) => {
	    _.extend(kid, {timestamp: data.timestamps[index]});
	});
	queue = this.rejectDeletedKid(data.queue);
	this.setState({data: queue,
		       timestamps: data.timestamps,
		       announcement: data.announcement,
		       paused: data.paused,
		       rev: data.rev,
	});
    }

    loadKidsFromServer = (rev=this.state.rev) => {
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
	    success: (data) => {
		this.setState({pendingXhr: null});
		if (oldUrl === this.props.url) {
		    this.updateQueue(data);
		    if (this.props.instructor && len < this.state.data.length) {
			this.refs.notify.play();
		    }
		    /* If nobody touched the timer before I get back, I will reset it */
		    if (timerId === this.state.loadKidsTimerId) {
			this.clearAndSetTimeout("loadKidsTimerId",
						this.loadKidsFromServer,
						0);
		    }
		}
	    },
	    error: (xhr, status, err) => {
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
		    );
		}
	    }
	});
	this.setState({pendingXhr: xhr});
    }

    refreshKidsFromServer = (props=this.props) => {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    data: {rev: 0},
	    success: (data) => {
		this.updateQueue(data);
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
	    }
	});
	/* Touching the timer will prevent returning requests from setting another */
	this.clearAndSetTimeout("loadKidsTimerId",
				this.loadKidsFromServer,
				0,
				0,
	);
    }

    displayNotification = (message,
			   ms=2000,
			   actionText="Okay",
			   action=this.dismissNotification,
			   onRequestClose=this.dismissNotification) => {
	this.setState({
	    notificationOpen: true,
	    notificationMessage: message,
	    notificationActionText: actionText,
	    notificationMs: ms,
	    notificationAction: action,
	    notificationOnRequestClose: onRequestClose,
	});
    }

    dismissNotification = () => {
	this.setState({
	    notificationOpen: false,
	});
    }

    handleKidSubmit = (kid) => {
	var url = this.props.instructor ?
		  "/instructor" + this.props.url :
		  this.props.url;

	$.ajax({
	    url: url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify(kid),
	    success: (data) => {
		this.updateQueue(data);
	    },
	    error: (xhr, status, err) => {
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
	    }
	});
    }

    handleKidDelete = (kid) => {
	var url = this.props.instructor ?
		  "/instructor" + this.props.url :
		  this.props.url;
	$.ajax({
	    url: url,
	    dataType: 'json',
	    type: 'DELETE',
	    data: {id: kid.id},
	    success: (data) => {
		this.setState({deletedKid: null});
		this.updateQueue(data);
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    this.clearAndSetTimeout("deleteKidTimerId", this.handleKidDelete, 2000, kid);
		}
		else {
		    this.setState({deletedKid: null});
		}
	    }
	});
    }

    handleRemoveAnnouncement = () => {
	$.ajax({
	    url: "/instructor" + this.props.url,
	    dataType: 'json',
	    type: 'PUT',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify({message: ""}),
	    success: (data) => {
		this.updateQueue(data);
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    this.clearAndSetTimeout("removeAnnouncementTimerId",
					    this.handleRemoveAnnouncement,
					    2000,
					    );
		}
	    }
	});
    }

    handleSnackRequestClose = (reason) => {
	if (reason) {
	    this.setState({snackOpen: false});
	    this.handleKidDelete(this.state.deletedKid);
	}
    }

    handleOkayQueueDeleted = (e) => {
	this.props.onSelectQueue();
    }

    handleWindowClose = (e) => {
	if (this.state.deletedKid) {
	    this.deleteKid();
	}
    }

    getDocumentTitle = () => {
	if (this.props.queueId == 0) {
	    return "q.cs";
	}

	var len = this.state.data.length;
	var lenstring = "";

	if (len) {
	    lenstring = "(" + len + ") ";
	}

	return lenstring + this.props.queueName;
    }

    tentativeKidDelete = (kid) => {
	if (this.state.deletedKid) {
	    /* No op; just let the previous one delete. */
	    return;
	}

	var tempData = this.rejectDeletedKid(this.state.data, kid);

	this.setState({deletedKid: kid,
		       snackOpen: true,
		       data: tempData,
	});
    }

    deleteKid = () => {
	this.handleKidDelete(this.state.deletedKid);
    }

    undoKidDelete = () => {
	this.setState({deletedKid: null,
		       snackOpen: false,
	});
	this.refreshKidsFromServer();
    }

    isEditing = () => {
	return _.contains(_.pluck(this.state.data, "id"), this.props.username);
    }

    handleAddExpandChange = (expanded) => {
	this.setState({adding: !this.state.paused && expanded});
    }

    handleAddOpen = () => {
	this.setState({adding: true});
    }

    handleAddReduceChange = () => {
	this.setState({adding: false});
    }

    render() {
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
}

export default ReactTimeout(Kids);
