import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardHeader} from 'material-ui/Card';
import $ from 'jquery';
import DocumentTitle from 'react-document-title';

import QAppBar from './QAppBar';
import QDrawer from './QDrawer/QDrawer';
import FakeAuthDialog from './FakeAuthDialog';
import Kids from './Kids/Kids';
import styles from './styles';

injectTapEventPlugin();

function LoggedOut(props) {
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


class App extends React.Component {
    state = {open: false,
	     queueName: "q.cs",
	     queueId: 0,
	     queueInstructor: false,
	     classes: {},
	     username: "",
	     refresh: false,
    }

    componentDidMount() {
	this.checkLoggedIn();
	this.loadClassesFromServer();
    }

    handleLeftIconButtonTouchTap = (e) => {
	this.setState({open: !this.state.open});
    }

    handleSelectQueue = (queueId=0, queueName="q.cs") => {
	this.setState({queueId: queueId, queueName: queueName, queueInstructor: false});
	this.setState({open: false});
	this.isQueueInstructor(queueId);
    }

    isQueueInstructor = (queueId) => {
	$.ajax({
	    url: "/instructor" + this.props.queue_url + queueId,
	    dataType: 'json',
	    type: 'GET',
	    success: (data) => {
		this.setState({queueInstructor: true});
	    },
	    error: (xhr, status, err) => {
		this.setState({queueInstructor: false});
	    }
	});
    }

    handleLogin = (data) => {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify(data),
	    success: (data) => {
		this.setState({username: data.username});
		this.setState({open: true});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.login_url, status, err.toString());
	    }
	});
    }

    checkLoggedIn = () => {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'GET',
	    success: (data) => {
		this.setState({username: data});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.login_url, status, err.toString());
	    }
	});
    }

    handleLogout = () => {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'DELETE',
	    success: (data) => {
		this.setState({username: null});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.login_url, status, err.toString());
	    }
	});
    }

    handleRefresh = () => {
	this.setState({refresh: !this.state.refresh});
    }

    loadClassesFromServer = () => {
	$.ajax({
	    url: this.props.class_url,
	    dataType: 'json',
	    cache: false,
	    success: (data) => {
		this.setState({classes: data});
	    },
	    error: (xhr, status, err) => {
		console.error(this.props.url, status, err.toString());
		if (xhr.status == 404) {
		    setTimeout(this.loadClassesFromServer, 2000);
		}
	    }
	});
    }

    render() {
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
			     queue_url={this.props.queue_url}
			     queueId={this.state.queueId}
			     instructor={this.state.queueInstructor}
			 />

			 {__FAKEAUTH__ && !this.state.username ?
			  <FakeAuthDialog onLogin={this.handleLogin} /> : null}

			 {this.state.queueId == 0 ? null :
			  <Kids url={this.props.queue_url + this.state.queueId}
				queueId={this.state.queueId}
				queueName={this.state.queueName}
				instructor={this.state.queueInstructor}
				username={this.state.username}
				refresh={this.state.refresh}
				onSelectQueue={this.handleSelectQueue}
			  />}

		     </div>) : <LoggedOut />}
	    </MuiThemeProvider>
	);
    }
}

ReactDOM.render(
    <DocumentTitle title="q.cs">
	<App class_url="/classes"
	     queue_url="/queue/"
	     queues_url="/class/"
	     login_url="/auth"
	/>
    </DocumentTitle>,
    document.getElementById('app')
);
