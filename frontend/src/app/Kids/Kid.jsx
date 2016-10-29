import React from 'react';
import {List, ListItem} from 'material-ui/List';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import ActionDone from 'material-ui/svg-icons/action/done';
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';

import seedrandom from 'seedrandom';
import tinycolor from 'tinycolor2';
import moment from 'moment';
import _ from 'underscore';

import styles from '../styles';

var material_palette = require("!json!./material_palette.json");


var Kid = React.createClass({
    getInitialState: function() {
	var color = this.generateColor();
	return ({color: color,
		 complement: tinycolor(color).complement().toHexString(),
		 timeDescription: "",
		 timerId: null,
	});
    },
    componentDidMount: function() {
	this.setState({timeDescription: this.describeTime(this.props.timestamp),
		       timerId: setTimeout(this.updateTime, 60000),
	});
    },
    componentDidUpdate: function(prevProps, prevState) {
	if (prevProps.timestamp != this.props.timestamp) {
	    this.setState({timeDescription: this.describeTime(this.props.timestamp)});
	}
    },
    componentWillUnmount: function() {
	clearTimeout(this.state.timerId);
    },
    handleButtonTouchTap: function(e) {
	this.props.onKidDelete({id: this.props.id});
    },
    handleTouchTap: function(e) {
	this.props.onKidAnswer({id: this.props.id,
				name: this.props.name,
				room: this.props.room,
				question: this.props.question,
				answer: !this.props.answer,
	});
    },
    generateColor: function() {
	var n = Math.seedrandom(this.props.id);
	var groups = Object.keys(material_palette);
	var group = groups[Math.floor(groups.length * Math.random())];
	var colors = Object.keys(material_palette[group]);
	var coloridx = Math.floor(colors.length * Math.random());
	var color = material_palette[group][colors[coloridx]];
	return color;
    },
    describeTime: function(timestamp) {
	return moment(timestamp).fromNow();
    },
    updateTime: function() {
	this.setState({timerId: setTimeout(this.updateTime, 60000),
		       timeDescription: this.describeTime(this.props.timestamp),
	});
    },
    render: function() {
	return (
	    <Card>
		<ListItem
		    primaryText={this.props.name + " – " + this.props.room}
		    secondaryText={<span>{this.props.question} <span style={styles.timestamp}> {this.state.timeDescription}</span></span>}
		    leftAvatar={<Avatar backgroundColor={this.state.color} >{this.props.name[0]} </Avatar>}
		    onTouchTap={this.props.instructor ? this.handleTouchTap : undefined}
		    leftIcon={this.props.answer ? <CircularProgress color={this.state.complement} size={0.75} style={styles.progress}/> : null}
		    rightIconButton={this.props.instructor || this.props.username == this.props.id ?
				     (
					 <IconButton
			     onTouchTap={this.handleButtonTouchTap}>
					     <ActionDone/>
					 </IconButton>
				     ) : null}
/>
	    </Card>
	);
    }
});


export default Kid;
