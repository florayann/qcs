import React from 'react';
import AppBar from 'material-ui/AppBar';

import QAppBarMenu from './QAppBarMenu';

class QAppBar extends React.Component {
    static propTypes = {
	queueName: React.PropTypes.string.isRequired,
	onRefresh: React.PropTypes.func.isRequired,
	onLogout: React.PropTypes.func.isRequired,
	onLeftIconButtonTouchTap: React.PropTypes.func.isRequired,
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
