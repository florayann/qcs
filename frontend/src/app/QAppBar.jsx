import React from 'react';
import AppBar from 'material-ui/AppBar';
import {white} from 'material-ui/styles/colors';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

var QAppBarMenu = React.createClass({
    render: function () {
	return (
	    <IconMenu iconButtonElement={<IconButton><MoreVertIcon color={white}/></IconButton>}
		      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
		      targetOrigin={{horizontal: 'right', vertical: 'top'}}
	    >
		<MenuItem primaryText="Refresh" onTouchTap={this.props.onRefresh}/>
		<MenuItem primaryText="Log out"
			  onTouchTap={this.props.onLogout}
		/>
	    </IconMenu>
	);
    }
});

var QAppBar = React.createClass({
    render: function () {
	return (
	    <AppBar
		title={this.props.queueName}
		onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
		iconElementRight={<QAppBarMenu onLogout={this.props.onLogout} onRefresh={this.props.onRefresh}/>}
	    />
	);
    }
});

export default QAppBar;