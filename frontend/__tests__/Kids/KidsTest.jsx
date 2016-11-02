import React from 'react';
import {mount, shallow} from 'enzyme';
import Kids from '../../src/app/Kids/Kids';
import {testData, testResponse} from './TestData';
import _ from 'underscore';

jest.unmock('../../src/app/Kids/Kids');
jest.unmock('./TestData');

const dummyProps = {
    instructor: false,
    onSelectQueue: () => {},
    queueId: '1',
    queueName: 'CS 233',
    refresh: false,
    setDocumentTitle: () => {},
    url: '/queue/',
    username: 'me',
};

describe('utility functions', () => {
    it('compares IDs correctly', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);
	let question = testData.short[0];
	let changedQuestion = _.extend(_.clone(question), {
            answer: false,
            name: "sfd",
            question: "sa",
            room: "sfd",
            timestamp: Date.now(),
	});
	expect(kidsWrapper.instance().hasSameId(question, changedQuestion)).toBe(true);
    });

    describe('rejects deleted kid', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);
	let deletedKid = _.last(testData.short);
	_.each(_.keys(testData), (k) => {
	    it(`when ${k}`, () => {
		let result = kidsWrapper.instance().rejectDeletedKid(testData[k],
								     deletedKid);
		expect(_.some(result, (kid) => {
		    return kid.id === deletedKid.id;
		})).toBe(false);
	    });
	});
    });

    describe('document title', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);

	beforeEach(() => {
	    kidsWrapper.setProps(dummyProps);
	});

	it('resets to q.cs when no queue selected', () => {
	    kidsWrapper.setProps({queueId: '0'});
	    expect(kidsWrapper.instance().getDocumentTitle()).toBe('q.cs');
	});

	it('displays only the queue name when queue is empty', () => {
	    kidsWrapper.setState({data: testData.empty});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(kidsWrapper.instance().props.queueName);
	});

	it('displays number of people on queue when not empty', () => {
	    let queueName = kidsWrapper.instance().props.queueName;
	    kidsWrapper.setState({data: testData.short});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.short.length}) ${queueName}`);
	    kidsWrapper.setState({data: testData.long});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.long.length}) ${queueName}`);
	});

	it('updates when queue name changes', () => {
	    kidsWrapper.setState({data: testData.short});
	    kidsWrapper.setProps({queueName: 'hi'});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.short.length}) hi`);
	    kidsWrapper.setProps({queueName: 'CS 233'});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.short.length}) CS 233`);
	});
    });

    describe('update queue', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);

	_.each(_.keys(testResponse), (k) => {
	    it(`works with ${k}`, () => {
		kidsWrapper.instance().updateQueue(testResponse[k]);
		expect(kidsWrapper.state().data).toEqual(testData[k]);
		expect(kidsWrapper.state().announcement)
		    .toEqual(testResponse[k].announcement);
		expect(kidsWrapper.state().paused).toEqual(testResponse[k].paused);
		expect(kidsWrapper.state().rev).toEqual(testResponse[k].rev);
	    });
	});

	it('rejects deleted kid', () => {
	    kidsWrapper.setState({deletedKid: _.first(testData.long)});
	    kidsWrapper.instance().updateQueue(testResponse.long);
	    expect(kidsWrapper.state().data).toEqual(_.rest(testData.long));
	});
    });
});

describe('notifications', () => {
    describe('generic notification', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);
	const notificationAction = jest.fn();

	beforeAll(() => {
	    kidsWrapper.instance().displayNotification('hello',
						       3000,
						       'ok',
						       notificationAction,
	    );
	    kidsWrapper.update();
	});

	it('opens', () => {
	    expect(kidsWrapper.find('Snackbar[message="hello"]').props().open).toBe(true);
	    expect(kidsWrapper.find('Snackbar[message="hello"]')
			      .props().autoHideDuration).toBe(3000);
	});

	it('activates action on action touch tap', () => {
	    kidsWrapper.find('Snackbar[message="hello"]').simulate('actionTouchTap');
	    expect(notificationAction).toHaveBeenCalled();
	});

	it('dismisses on request close', () => {
	    kidsWrapper.find('Snackbar[message="hello"]').simulate('requestClose');
	    kidsWrapper.update();
	    expect(kidsWrapper.find('Snackbar[message="hello"]').props().open)
		.toBe(false);
	});
    });

    describe('undo notification', () => {
	let kidsWrapper = shallow(<Kids {...dummyProps} />);

	beforeAll(() => {
	    kidsWrapper.instance().undoKidDelete = jest.fn();
	    kidsWrapper.instance().handleSnackRequestClose = jest.fn();
	});

	it('opens on snackOpen', () => {
	    kidsWrapper.setState({snackOpen: true});
	    kidsWrapper.update();
	    expect(kidsWrapper.find('Snackbar[action="undo"]').props().open).toBe(true);
	});

	it('calls undo delete on action touch tap', () => {
	    kidsWrapper.find('Snackbar[action="undo"]').simulate('actionTouchTap');
	    expect(kidsWrapper.instance().undoKidDelete).toHaveBeenCalled();
	});

	it('calls undo snack request close on dismiss', () => {
	    kidsWrapper.find('Snackbar[action="undo"]').simulate('requestClose');
	    expect(kidsWrapper.instance().handleSnackRequestClose).toHaveBeenCalled();
	});
    });
});

describe('event handlers', () => {
});
