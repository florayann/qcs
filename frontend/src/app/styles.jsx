import {grey400} from 'material-ui/styles/colors';

var styles = {
    done: {
	right: 0,
	position: 'absolute',
    },
    progress: {
	left: -1,
	top: -1,
	position: 'absolute',
    },
    container: {
	marginLeft: "25%",
	marginRight: "25%",
	marginTop: "5%",
	marginBottom: "5%",
    },
    containerMobile: {
	margin: 0,
    },
    list: {
	paddingTop: 0,
	paddingBottom: 0,
    },
    timestamp: {
	color: grey400,
	fontSize: 10,
    },
    addButton: {
	position: 'fixed',
	right: 20,
	bottom: 20,
    },
};

export default styles;
