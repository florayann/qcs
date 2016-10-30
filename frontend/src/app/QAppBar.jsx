import React from 'react';
import AppBar from 'material-ui/AppBar';
import {white} from 'material-ui/styles/colors';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';


class QAppBarMenu extends React.Component {
    static propTypes = {
	onRefresh: React.PropTypes.func.required,
	onLogout: React.PropTypes.func.required,
    }

    render() {
	return (
	    <IconMenu anchorOrigin={{horizontal: 'right', vertical: 'top'}}
		      targetOrigin={{horizontal: 'right', vertical: 'top'}}
		      iconButtonElement={
			  <IconButton>
			      <MoreVertIcon color={white}/>
			  </IconButton>}
	    >
		<MenuItem primaryText="Refresh" onTouchTap={this.props.onRefresh}/>
		<MenuItem primaryText="Log out"
			  onTouchTap={this.props.onLogout}
		/>
	    </IconMenu>
	);
    }
}


class QAppBar extends React.Component {
    static propTypes = {
	queueName: React.PropTypes.string.required,
	onRefresh: React.PropTypes.func.required,
	onLogout: React.PropTypes.func.required,
	onLeftIconButtonTouchTap: React.PropTypes.func.required,
    }

    render() {
	return (
	    <AppBar title={this.props.queueName}
		    iconElementRight={<QAppBarMenu onRefresh={this.props.onRefresh}
						   onLogout={this.props.onLogout}
				      />}
		    onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
	    />
	);
    }
}


export default QAppBar;
