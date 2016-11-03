import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardHeader} from 'material-ui/Card';
import $ from 'jquery';

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
    static propTypes = {
	class_url: React.PropTypes.string.isRequired,
	login_url: React.PropTypes.string.isRequired,
	queue_url: React.PropTypes.string.isRequired,
	queues_url: React.PropTypes.string.isRequired,
    }

    state = {open: false,
	     queueName: "q.cs",
	     queueId: "0",
	     queueInstructor: false,
	     classes: {},
	     username: "",
	     refresh: false,
    }

    componentDidMount() {
	this.setDocumentTitle('q.cs');
	this.checkLoggedIn();
	this.loadClassesFromServer();
    }

    handleLeftIconButtonTouchTap = (e) => {
	this.setState({open: !this.state.open});
    }

    handleSelectQueue = (queueId="0", queueName="q.cs") => {
	if (queueId === '0') {
	    this.setDocumentTitle();
	}
	this.setState({queueId: queueId, queueName: queueName, queueInstructor: false});
	this.setState({open: false});
	this.isQueueInstructor(queueId);
    }

    setDocumentTitle(title='q.cs') {
	document.title = title;
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
	    },
	});
    }

    handleLogin = (data) => {
	$.ajax({
	    url: this.props.login_url,
	    dataType: 'json',
	    type: 'POST',
	    contentType: 'application/json; charset=UTF-8',
	    data: JSON.stringify(data),
	    success: (response) => {
		this.setState({username: response.username});
		this.setState({open: true});
	    },
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
		if (xhr.status === 404) {
		    setTimeout(this.loadClassesFromServer, 2000);
		}
	    },
	});
    }

    render() {
	return (
	    <MuiThemeProvider>
		{this.state.username !== null ? (
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

			 {process.env.NODE_ENV === "test" ||
			  __FAKEAUTH__ && !this.state.username ?
			  <FakeAuthDialog onLogin={this.handleLogin} /> : null}

			 {this.state.queueId === "0" ? null :
			  <Kids url={this.props.queue_url + this.state.queueId}
				queueId={this.state.queueId}
				queueName={this.state.queueName}
				instructor={this.state.queueInstructor}
				username={this.state.username}
				refresh={this.state.refresh}
				onSelectQueue={this.handleSelectQueue}
				setDocumentTitle={this.setDocumentTitle}
			  />}

		     </div>) : <LoggedOut />}
	    </MuiThemeProvider>
	);
    }
}

if (process.env.NODE_ENV !== "test") {
    ReactDOM.render(
	    <App class_url="/classes"
		 queue_url="/queue/"
		 queues_url="/class/"
		 login_url="/auth"
	    />,
	document.getElementById('app')
    );
}

export default App;
