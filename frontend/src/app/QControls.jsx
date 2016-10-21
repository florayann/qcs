import React from 'react';
import $ from 'jquery';
import {List, ListItem} from 'material-ui/List';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import PauseArrow from 'material-ui/svg-icons/av/pause';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

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
		</List>
	    </div>
	);
    }
});

export default QControls;
