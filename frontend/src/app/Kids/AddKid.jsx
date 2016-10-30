import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import _ from 'underscore';


class AddKid extends React.Component {
    state = {
	name: "",
	room: "",
	question: "",
	attemptedSubmit: false,
    }

    handleNameChange = (e) => {
	this.setState({name: e.target.value});
    }

    handleRoomChange = (e) => {
	this.setState({room: e.target.value});
    }

    handleQuestionChange = (e) => {
	this.setState({question: e.target.value});
    }

    submitKid = (e) => {
	this.props.onKidSubmit({
	    name: this.state.name.trim(),
	    room: this.state.room.trim(),
	    question: this.state.question.trim(),
	});
	this.setState({room: '', question: '', attemptedSubmit: false});
	this.props.onAddReduceChange();
    }

    handleKeyPress = (target) => {
	if (target.charCode === 13) {
	    if (this.state.name && this.state.room && this.state.question) {
		this.submitKid();
	    }
	    else {
		this.setState({attemptedSubmit: true});
	    }
	}
    }

    render() {
	return (
	    <Card expanded={this.props.adding}
		  onExpandChange={this.props.onAddExpandChange}
	    >
		<CardHeader
		    title={this.props.editing ? "Edit Question" : "New Question"}
		    subtitle={this.props.paused ?
			      "Submission currently disabled!" :
			      "Expand to add!"}
		    actAsExpander={true}
		    showExpandableButton={true}
		    avatar={<Avatar>{this.props.adding ? "-" : "+"}</Avatar>}
		/>
		<CardText expandable={true}>
		    <TextField
			hintText="Name"
			floatingLabelText="Name"
			errorText={!this.state.attemptedSubmit || this.state.name ?
				   "" :
				   "This field is required"}
			value={this.state.name}
			onChange={this.handleNameChange}
			onKeyPress={this.handleKeyPress}
			autoFocus={true}
		    />
		    <br/>
		    <TextField
			hintText="Room"
			floatingLabelText="Room"
			errorText={!this.state.attemptedSubmit || this.state.room ?
				   "" :
				   "This field is required"}
			value={this.state.room}
			onChange={this.handleRoomChange}
			onKeyPress={this.handleKeyPress}
		    />
		    <br/>
		    <TextField
			hintText="Question"
			floatingLabelText="Question"
			errorText={!this.state.attemptedSubmit || this.state.question ?
				   "" :
				   "This field is required"}
			value={this.state.question}
			onChange={this.handleQuestionChange}
			onKeyPress={this.handleKeyPress}
		    />
		    <br/>
		    <CardActions>
			<FlatButton
			    label="Submit"
			    disabled={!(this.state.name &&
					this.state.room &&
					this.state.question)}
			    primary={true}
			    onTouchTap={this.submitKid}
			/>
		    </CardActions>
		</CardText>
	    </Card>
	);
    }
}


export default AddKid;
