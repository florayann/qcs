import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';

injectTapEventPlugin();

var testData = [
    {
	"name":"Flora",
	"room": "216",
	"question": "Mp4",
	"id": "f19"
    },
    {
	"name":"Thomas",
	"room": "218",
	"question": "Lab 2",
	"id": "t2"
    },
    {
	"name":"Dummy",
	"room": "Lost",
	"question": "sldksd",
	"id": "dum21"
    }
]

var Kids = React.createClass({
    render: function() {
	return (
	    <div className="Kids">
		<KidsList data={this.props.data} />
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
		    <Kids data={this.props.data}/>
		</div>
	    </MuiThemeProvider>
	);
    }
});

ReactDOM.render(
    <App data={testData}/>,
    document.getElementById('app')
);
