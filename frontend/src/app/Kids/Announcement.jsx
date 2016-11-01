import React from 'react';
import {ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionAnnouncement from 'material-ui/svg-icons/action/announcement';
import IconButton from 'material-ui/IconButton';

import {darkBlack} from 'material-ui/styles/colors';


class Announcement extends React.Component {
    static propTypes = {
	instructor: React.PropTypes.bool.isRequired,
	message: React.PropTypes.string.isRequired,
	muiTheme: React.PropTypes.object.isRequired,
	onRemove: React.PropTypes.func.isRequired,
    }

    render() {
	var announcementAvatar = (
	    <Avatar icon={<ActionAnnouncement />}
		    backgroundColor={this.props.muiTheme.palette.accent1Color}
	    />
	);

	return (
	    <ListItem primaryText={<strong>Announcement</strong>}
		      secondaryText={
			  <p>
			      <span style={{color: darkBlack}}>
					  {this.props.message}
			      </span>
			  </p>}
		      leftAvatar={announcementAvatar}
		      disabled={true}
		      rightIconButton={this.props.instructor ?
				       <IconButton onTouchTap={this.props.onRemove}>
					   <ActionDelete />
				       </IconButton> :
				       null}
	    />
	);
    }
}

export default Announcement;
