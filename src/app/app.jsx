import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import $ from 'jquery';

injectTapEventPlugin();

var Kids = React.createClass({
    getInitialState: function() {
	return {data: []};
    },
    loadKidsFromServer: function() {
	$.ajax({
	    url: this.props.url,
	    dataType: 'json',
	    cache: false,
	    success: function(data) {
		this.setState({data: data});
	    }.bind(this),
	    error: function(xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	    }.bind(this)
	});
    },
    componentDidMount: function() {
	this.loadKidsFromServer();
	setInterval(this.loadKidsFromServer, 2000);
    },
    render: function() {
	return (
	    <div className="Kids">
		<KidsList data={this.state.data} />
	    </div>
	);
    }
});

var KidsList = React.createClass({
    render: function() {
	var kidsNodes = this.props.data.map(function(kid) {
	    return (
		<Kid name={kid.name} room={kid.room} question={kid.question} key={kid.id} />
	    );
	});
	return (
	    <div className="kidsList">
	    {kidsNodes}
	    </div>
	);
    }
});

var Kid = React.createClass({
    render: function() {
	return (
	    <Card>
		<CardHeader
		    title={this.props.name + " - " + this.props.room}
		    subtitle={this.props.question}
		    avatar={<Avatar>{this.props.name[0]}</Avatar>}
		/>
	    </Card>
	);
    }
})

const QAppBar = () => (
    <AppBar
	title="q.cs"
    />
);

var App = React.createClass({
    render: function() {
	return(
	    <MuiThemeProvider>
		<div>
		    <QAppBar/>
		    <Kids url={this.props.url}/>
		</div>
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <App url="/hello" />,
    document.getElementById('app')
);
