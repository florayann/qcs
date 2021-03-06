import React from 'react';
import {white} from 'material-ui/styles/colors';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';


class QAppBarMenu extends React.Component {
    static propTypes = {
	onRefresh: React.PropTypes.func.isRequired,
	onLogout: React.PropTypes.func.isRequired,
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


export default QAppBarMenu;
