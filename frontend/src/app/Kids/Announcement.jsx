import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionAnnouncement from 'material-ui/svg-icons/action/announcement';
import IconButton from 'material-ui/IconButton';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';


var Announcement = React.createClass({
    render: function() {
	return (
	    <ListItem primaryText={<strong>Announcement</strong>}
		      secondaryText={<p><span style={{color: darkBlack}}>{this.props.message}</span></p>}
		      leftAvatar={<Avatar icon={<ActionAnnouncement />}
					  backgroundColor={this.props.muiTheme.palette.accent1Color} />}
		      disabled={true}
		      rightIconButton={this.props.instructor ?
				       <IconButton onTouchTap={this.props.onRemove}><ActionDelete /> </IconButton> :
				       null}
	    />
	);
    }
});

export default muiThemeable()(Announcement);
