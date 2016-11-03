import React from 'react';
import $ from 'jquery';
import {List, ListItem} from 'material-ui/List';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import PauseArrow from 'material-ui/svg-icons/av/pause';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

import AnnounceButton from './AnnounceButton';


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
