import React from 'react';
import {mount, shallow} from 'enzyme';
import KidsList from '../../src/app/Kids/KidsList';
import styles from '../../src/app/styles';
import testData from './TestData';

jest.unmock('../../src/app/Kids/KidsList');
jest.unmock('../../src/app/Kids/Announcement');
jest.unmock('./TestData');

const dummyProps = {
    adding: false,
    announcement: '',
    data: [],
    editing: false,
    instructor: false,
    onAddExpandChange: () => {},
    onAddReduceChange: () => {},
    onKidAnswer: () => {},
    onKidDelete: () => {},
    onKidSubmit: () => {},
    onRemoveAnnouncement: () => {},
    paused: false,
    username: 'user',
};

describe('user experience', () => {
    beforeAll(() => {
    });

    it('adjusts style for mobile', () => {
	const kidsList = shallow(<KidsList {...dummyProps}
				 />);
	window.matchMedia = jest.fn(() => {
	    return {matches: true};
	})
				.mockImplementationOnce(() => {
				    return {matches: false};
				});

	kidsList.instance().checkMobile();
	expect(kidsList.state().s).toBe(styles.container);
	kidsList.instance().checkMobile();
	expect(kidsList.state().s).toBe(styles.containerMobile);
    });

    it('shows announcement when announced', () => {
	const kidsList = <KidsList {...dummyProps} />;
	let kidsListWrapper = shallow(kidsList);
	expect(kidsListWrapper.find('List').props().children[0]).toBe(null);
	kidsListWrapper.setProps({announcement: 'hi'});
	expect(kidsListWrapper.find('List').props().children[0].type).not.toBe(null);
    });

    it('renders kids properly when data exists', () => {
	const kidsList = shallow(<KidsList {...dummyProps}
				 />);
	kidsList.setProps({data: testData});
	expect(kidsList.find('Kid').length).toBe(testData.length);
    });
});

describe('life cycle', () => {
    const UnrenderedKidsList = require('../../src/app/Kids/KidsList').default;
    const windowAddListener = jest.fn();
    const windowRemoveListener = jest.fn();
    let kidsListWrapper;

    beforeAll(() => {
	UnrenderedKidsList.prototype.render = () => {
	    return <div />;
	};

	window.addEventListener = (e, fn) => {
	    if (e === 'resize') {
		windowAddListener();
	    }
	};

	window.removeEventListener = (e, fn) => {
	    if (e === 'resize') {
		windowRemoveListener();
	    }
	};

	window.matchMedia = jest.fn(() => {
	    return {matches: true};
	});

	kidsListWrapper = mount(<UnrenderedKidsList {...dummyProps} />);
    });

    it('adds resize listener after mount', () => {
	expect(windowAddListener).toHaveBeenCalled();
    });

    it('checks mobile after mount', () => {
	expect(kidsListWrapper.state().s).toBe(styles.containerMobile);
    });

    it('removes resize listener after unmount', () => {
	kidsListWrapper.unmount();
	expect(windowRemoveListener).toHaveBeenCalled();
    });
});
