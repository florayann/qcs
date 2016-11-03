import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {List} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import QControls from './QControls';
import QClass from './QClass';

class ClassList extends React.Component {
    static propTypes = {
	classes: React.PropTypes.object.isRequired,
	onSelectQueue: React.PropTypes.func.isRequired,
	url: React.PropTypes.string.isRequired,
	drawerOpen: React.PropTypes.bool.isRequired,
    }

    render() {
	var classNodes = Object.keys(this.props.classes).map(function (classId) {
	    return (
		<QClass classId={classId}
			key={classId}
			name={this.props.classes[classId]}
			onSelectQueue={this.props.onSelectQueue}
			url={this.props.url + classId}
			drawerOpen={this.props.drawerOpen}
		/>
	    );
	}.bind(this));
	return (
	    <List>
		<Subheader>Classes</Subheader>
		{classNodes}
	    </List>
	);
    }
}

class QDrawer extends React.Component {
    static propTypes = {
	classes: React.PropTypes.object.isRequired,
	onSelectQueue: React.PropTypes.func.isRequired,
	onRequestChange: React.PropTypes.func.isRequired,
	open: React.PropTypes.bool.isRequired,
	url: React.PropTypes.string.isRequired,
	queue_url: React.PropTypes.string.isRequired,
	queueId: React.PropTypes.string.isRequired,
	instructor: React.PropTypes.bool.isRequired,
    }
    handleRequestChange = (open, reason) => {
	this.props.onRequestChange();
    }

    render() {
	return (
	    <div>
		<Drawer open={this.props.open}
			docked={false}
			onRequestChange={this.handleRequestChange}
		>
		    <AppBar title="q.cs" showMenuIconButton={false}/>
		    <ClassList classes={this.props.classes}
			       onSelectQueue={this.props.onSelectQueue}
			       url={this.props.url}
			       drawerOpen={this.props.open}
		    />
		    {this.props.instructor ?
		     <QControls url={this.props.queue_url + "info/" + this.props.queueId}
				queue_url={this.props.queue_url + this.props.queueId}
		     />
		     : null
		    }
		</Drawer>
	    </div>
	);
    }
}


export default QDrawer;
