import React from 'react';
import {List} from 'material-ui/List';

import FlipMove from 'react-flip-move';
import Visibility from 'visibilityjs';
import _ from 'underscore';

import styles from '../styles';
import Kid from './Kid';
import AddKid from './AddKid';
import Announcement from './Announcement';


class KidsList extends React.Component {
    state = {
	s: styles.container,
    }

    constructor(props) {
	super(props);
	window.addEventListener("resize", this.checkMobile);
    }

    componentDidMount() {
	this.checkMobile();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.checkMobile);
    }

    checkMobile = () => {
	if (window.matchMedia("only screen and (max-width: 760px)").matches) {
            this.setState({s: styles.containerMobile});
	}
	else {
	    this.setState({s: styles.container});
	}
    }

    render() {
	var kidsNodes = this.props.data.map((kid) => {
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
	});
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
			  disableAllAnimations={Visibility.state() !== "visible"}
		>
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
}


export default KidsList;
