import React from 'react';
import {List, ListItem} from 'material-ui/List';

import FlipMove from 'react-flip-move';
import Visibility from 'visibilityjs';
import _ from 'underscore';

import styles from '../styles';
import Kid from './Kid';
import AddKid from './AddKid';
import Announcement from './Announcement';

var KidsList = React.createClass({
    checkMobile: function() {
	if (window.matchMedia("only screen and (max-width: 760px)").matches) {
            this.setState({s: styles.containerMobile});
	}
	else {
	    this.setState({s: styles.container});
	}
    },
    componentWillMount: function() {
        this.checkMobile();
    },
    componentDidMount: function() {
        window.addEventListener("resize", this.checkMobile);
    },
    componentWillUnmount: function() {
        window.removeEventListener("resize", this.checkMobile);
    },
    render: function() {
	var kidsNodes = this.props.data.map(function(kid) {
	    return (
		<Kid name={kid.name}
		     room={kid.room}
		     question={kid.question}
		     id={kid.id}
		     answer={kid.answer}
		     timestamp={kid.timestamp}
		     key={kid.id}
		     onKidDelete={this.props.onKidDelete}
		     onKidAnswer={this.props.onKidAnswer}
		     username={this.props.username}
		     instructor={this.props.instructor}
		/>
	    );
	}.bind(this));
	return (
	    <div className="kidsList" style={this.state.s}>
		<List style={styles.list}>
		    {this.props.announcement ?
		     <Announcement key={-41}
				   message={this.props.announcement}
				   onRemove={this.props.onRemoveAnnouncement}
				   instructor={this.props.instructor}
		     /> :
		     null}
		<FlipMove enterAnimation={"elevator"}
			  leaveAnimation={"elevator"}
			  staggerDurationBy={10}
			  staggerDelayBy={10}
			  disableAllAnimations={Visibility.state() != "visible"}>
		    {kidsNodes}
		    <AddKid key={-42}
			    onKidSubmit={this.props.onKidSubmit}
			    editing={this.props.editing}
			    paused={this.props.paused}
			    adding={this.props.adding}
			    onAddExpandChange={this.props.onAddExpandChange}
			    onAddReduceChange={this.props.onAddReduceChange}
		    />
		</FlipMove>
		</List>
	    </div>
	);
    }
});


export default KidsList;
