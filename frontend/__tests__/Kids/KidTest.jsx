import React from 'react';
import {mount, shallow} from 'enzyme';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import Kid from '../../src/app/Kids/Kid';

jest.unmock('../../src/app/Kids/Kid');
jest.unmock('tinycolor2');
jest.unmock('moment');

const dummyProps = {
    name: 'kid',
    room: 'room',
    question: 'question',
    id: 'user',
    instructor: false,
    answer: false,
    timestamp: 1478022603470,
    username: 'me',
    onKidAnswer: () => {},
    onKidDelete: () => {},
};

describe('color', () => {
    const kid = shallow(<Kid {...dummyProps}
			/>);
    it('generates color deterministically', () => {
	let color = kid.instance().generateColor();
	expect(color).toBe(kid.instance().generateColor());
    });

    it('generates a different color for a different userid', () => {
	let color = kid.instance().generateColor();
	let otherKid = shallow(<Kid {...dummyProps}
				    id="other"
			       />);
	expect(color).not.toBe(otherKid.instance().generateColor());
    });
});

describe('answering', () => {
    const kidAnswer = jest.fn();
    const kid = shallow(<Kid {...dummyProps}
			     onKidAnswer={kidAnswer}
			/>);

    beforeEach(() => {
	jest.clearAllMocks();
    });

    it('does not answer on student touch tap', () => {
	kid.find('ListItem').simulate('touchTap');
	expect(kidAnswer).not.toHaveBeenCalled();
    });

    it('toggles answer on instructor touch tap', () => {
	kid.setProps({instructor: true});
	kid.find('ListItem').simulate('touchTap');
	expect(kidAnswer.mock.calls[0][0].answer).not.toBe(kid.props().answer);
    });

    it('shows circular progress when answering', () => {
	expect(kid.find('ListItem').props().leftIcon).toBe(null);
	kid.setProps({answer: true});
	expect(kid.find('ListItem').props().leftIcon.type).toBe(CircularProgress);
    });
});

describe('marking as done', () => {
    const kidDelete = jest.fn();
    const myQuestion = shallow(<Kid {...dummyProps}
				    onKidDelete={kidDelete}
				    id="me"
				    username="me"
			       />);
    const otherQuestion = shallow(<Kid {...dummyProps}
				       onKidDelete={kidDelete}
				       id="other"
				       username="me"
				  />);

    beforeEach(() => {
	jest.clearAllMocks();
    });

    it('can mark own question as done', () => {
	let doneButton = myQuestion.find('ListItem').props().rightIconButton;
	expect(doneButton.type).toBe(IconButton);
	doneButton.props.onTouchTap();
	expect(kidDelete.mock.calls[0][0].id).toBe('me');
    });

    it('cannot mark other\'s questions as done when student', () => {
	let doneButton = otherQuestion.find('ListItem').props().rightIconButton;
	expect(doneButton).toBe(null);
    });

    it('can mark other\'s questions as done when instructor', () => {
	otherQuestion.setProps({instructor: true});
	let doneButton = otherQuestion.find('ListItem').props().rightIconButton;
	expect(doneButton.type).toBe(IconButton);
	doneButton.props.onTouchTap();
	expect(kidDelete.mock.calls[0][0].id).toBe('other');
    });
});

describe('timestamps', () => {
    beforeAll(() => {
	jest.useFakeTimers();
    });

    it('describes new time on timestamp change', () => {
	const kid = shallow(<Kid {...dummyProps}
				 timestamp={Date.now()}
			    />);
	expect(kid.state().timeDescription).toBe('a few seconds ago');
	kid.setProps({timestamp: Date.now() - 60000});
	expect(kid.state().timeDescription).toBe('a minute ago');
    });

    it('update time updates every minute', () => {
	const kid = shallow(<Kid {...dummyProps}
				 timestamp={Date.now()}
			    />);
	kid.instance().updateTime();
	expect(setTimeout.mock.calls[0][0]).toBe(kid.instance().updateTime);
	jest.runOnlyPendingTimers();
	expect(setTimeout.mock.calls[1][0]).toBe(kid.instance().updateTime);
    });
});

describe('life cycle', () => {
    const UnrenderedKid = require('../../src/app/Kids/Kid').default;

    beforeAll(() => {
	UnrenderedKid.prototype.render = () => {
	    return <div />;
	};

	jest.useFakeTimers();
    });

    it('sets timer on mount', () => {
	const kid = mount(<UnrenderedKid {...dummyProps}
			  />);
	expect(setTimeout).toHaveBeenCalled();
	expect(kid.instance().timerId).toBeTruthy();
    });

    it('clears timer on unmount', () => {
	const kid = mount(<UnrenderedKid {...dummyProps}
			  />);
	let timerId = kid.instance().timerId;
	kid.unmount();
	expect(clearTimeout.mock.calls[0][0]).toBe(timerId);
    });
});
