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


class Kid extends React.Component {
    constructor(props) {
	super(props);
	var color = this.generateColor();
	this.state = {color: color,
		      complement: tinycolor(color).complement().toHexString(),
		      timeDescription: "",
		      timerId: null,
	};
    }
    
    componentDidMount() {
	this.setState({timeDescription: this.describeTime(this.props.timestamp),
		       timerId: setTimeout(this.updateTime, 60000),
	});
    }
    
    componentDidUpdate(prevProps, prevState) {
	if (prevProps.timestamp != this.props.timestamp) {
	    this.setState({timeDescription: this.describeTime(this.props.timestamp)});
	}
    }
    
    componentWillUnmount() {
	clearTimeout(this.state.timerId);
    }
    
    handleButtonTouchTap = (e) => {
	this.props.onKidDelete({id: this.props.id});
    }
    
    handleTouchTap = (e) => {
	this.props.onKidAnswer({id: this.props.id,
				name: this.props.name,
				room: this.props.room,
				question: this.props.question,
				answer: !this.props.answer,
	});
    }
    
    generateColor = () => {
	var n = Math.seedrandom(this.props.id);
	var groups = Object.keys(material_palette);
	var group = groups[Math.floor(groups.length * Math.random())];
	var colors = Object.keys(material_palette[group]);
	var coloridx = Math.floor(colors.length * Math.random());
	var color = material_palette[group][colors[coloridx]];
	return color;
    }
    
    describeTime(timestamp) {
	return moment(timestamp).fromNow();
    }
    
    updateTime = () => {
	this.setState({timerId: setTimeout(this.updateTime, 60000),
		       timeDescription: this.describeTime(this.props.timestamp),
	});
    }
    
    render() {
	var answeringCircle = null;
	var doneButton = null;

	if (this.props.answer) {
	    answeringCircle = (
		<CircularProgress color={this.state.complement}
				  size={0.75}
				  style={styles.progress}
		/>
	    );
	}

	if (this.props.instructor || this.props.username == this.props.id) {
	    doneButton = (
		<IconButton onTouchTap={this.handleButtonTouchTap}>
		    <ActionDone/>
		</IconButton>
	    );
	}

	return (
	    <Card>
		<ListItem
		    primaryText={this.props.name + " – " + this.props.room}
		    secondaryText={
			<span>{this.props.question}
			    <span style={styles.timestamp}>
					&nbsp;{this.state.timeDescription}
			    </span>
			</span>}
		    leftAvatar={
			<Avatar backgroundColor={this.state.color}>
						{this.props.name[0]}
			</Avatar>}
		    onTouchTap={this.props.instructor ? this.handleTouchTap : undefined}
		    leftIcon={answeringCircle}
		    rightIconButton={doneButton}
		/>
	    </Card>
	);
    }
}


export default Kid;
