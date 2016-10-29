import React from 'react';
import AppBar from 'material-ui/AppBar';
import $ from 'jquery';
import Drawer from 'material-ui/Drawer';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import QControls from './QControls';
import QClass from './QClass';

var ClassList = React.createClass({
    render: function() {
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
});

var QDrawer = React.createClass({
    handleRequestChange: function(open, reason) {
	if (!open) {
	    this.props.onRequestChange();
	}
    },
    render: function() {
	return (
	    <div>
		<Drawer open={this.props.open} docked={false} onRequestChange={this.handleRequestChange}>
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
});


export default QDrawer;
