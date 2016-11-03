import React from 'react';
import {mount, shallow} from 'enzyme';
import Kids from '../../src/app/Kids/Kids';
import {testData, testResponse} from './TestData';
import _ from 'underscore';
import $ from 'jquery';

jest.unmock('../../src/app/Kids/Kids');
jest.unmock('./TestData');

const dummyProps = {
    instructor: false,
    onSelectQueue: () => {},
    queueId: '1',
    queueName: 'CS 233',
    refresh: false,
    setDocumentTitle: () => {},
    url: '/queue/1',
    username: 'me',
};

function selectQueue(wrapper, queueId, queueName) {
    wrapper.setProps({url: '/queue/' + queueId,
		      queueId: queueId,
		      queueName: queueName,
    });
}

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

    describe('clear and set timeout', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);

	beforeAll(() => {
	    jest.useFakeTimers();
	});

	beforeEach(() => {
	    jest.clearAllMocks();
	});

	it('runs function with correct args after timeout', () => {
	    const fn = jest.fn();
	    kidsWrapper.instance().clearAndSetTimeout('a', fn, 1000, 1, 2, 3, 4, 5);
	    expect(_.last(setTimeout.mock.calls)[0]).toBe(fn);
	    expect(_.last(setTimeout.mock.calls)[1]).toBe(1000);
	    jest.runOnlyPendingTimers();
	    expect(fn).toHaveBeenCalledWith(1, 2, 3, 4, 5);
	});

	it('saves the timerid', () => {
	    let timerId = kidsWrapper.instance()
				     .clearAndSetTimeout('test', () => {}, 1000, 1, 2);
	    expect(kidsWrapper.instance().timerIds.test).toBe(timerId);
	});

	it('clears the previous timerid', () => {
	    let timerId = kidsWrapper.instance()
				     .clearAndSetTimeout('b', () => {}, 1000, 4, 5);
	    kidsWrapper.instance().clearAndSetTimeout('b', () => {}, 1000, 4, 5);
	    expect(clearTimeout).toHaveBeenLastCalledWith(timerId);
	});
    });

    describe('is editing', () => {
	const myUsername = 'weirdo';
	const kidsWrapper = shallow(<Kids {...dummyProps}
					  username={myUsername}
				    />);

	it('returns false when empty', () => {
	    kidsWrapper.setState({data: testData.empty});
	    expect(kidsWrapper.instance().isEditing()).toBe(false);
	});

	it('returns false when I am not on the queue', () => {
	    kidsWrapper.setState({data: testData.short});
	    expect(kidsWrapper.instance().isEditing()).toBe(false);
	    kidsWrapper.setState({data: testData.long});
	    expect(kidsWrapper.instance().isEditing()).toBe(false);
	});

	it('returns true when I am on the queue', () => {
	    kidsWrapper.setState({data: testData.short});
	    kidsWrapper.setProps({username: testData.short[0].id});
	    expect(kidsWrapper.instance().isEditing()).toBe(true);
	    kidsWrapper.setState({data: testData.long});
	    kidsWrapper.setProps({username: _.last(testData.long).id});
	    expect(kidsWrapper.instance().isEditing()).toBe(true);
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

    describe('audio notification', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps}
					  instructor={true}
				    />);

	beforeAll(() => {
	    kidsWrapper.instance().clearAndSetTimeout = () => {};
	    kidsWrapper.instance().audioNotification = {play: jest.fn()};
	});

	beforeEach(() => {
	    kidsWrapper.instance().audioNotification.play.mockClear();
	});

	it('plays when queue grows', () => {
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.short);
	    expect(kidsWrapper.instance().audioNotification.play).toHaveBeenCalled();
	    kidsWrapper.instance().audioNotification.play.mockClear();
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.long);
	    expect(kidsWrapper.instance().audioNotification.play).toHaveBeenCalled();
	});

	it('does not play when queue shrinks', () => {
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.long);
	    kidsWrapper.instance().audioNotification.play.mockClear();
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.short);
	    expect(kidsWrapper.instance().audioNotification.play).not.toHaveBeenCalled();
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.empty);
	    expect(kidsWrapper.instance().audioNotification.play).not.toHaveBeenCalled();
	});

	it('does not play as student', () => {
	    kidsWrapper.setProps({instructor: false});
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.empty);
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.short);
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.long);
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.short);
	    kidsWrapper.instance().loadKidsFromServer();
	    _.last($.ajax.mock.calls)[0].success(testResponse.empty);
	    expect(kidsWrapper.instance().audioNotification.play).not.toHaveBeenCalled();
	});
    });

    describe('undo notification', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);

	beforeAll(() => {
	    kidsWrapper.instance().undoKidDelete = jest.fn();
	    kidsWrapper.instance().handleKidDelete = jest.fn();
	});

	it('opens on snackOpen', () => {
	    kidsWrapper.instance().tentativeKidDelete({id: 'test'});
	    kidsWrapper.update();
	    expect(kidsWrapper.find('Snackbar[action="undo"]').props().open).toBe(true);
	});

	it('calls undo delete on action touch tap', () => {
	    kidsWrapper.find('Snackbar[action="undo"]').simulate('actionTouchTap');
	    expect(kidsWrapper.instance().undoKidDelete).toHaveBeenCalled();
	});

	it('calls undo snack request close on dismiss', () => {
	    kidsWrapper.find('Snackbar[action="undo"]').simulate('requestClose');
	    expect(kidsWrapper.find('Snackbar[action="undo"]').props().open).toBe(false);
	    expect(kidsWrapper.instance().handleKidDelete).toHaveBeenCalled();
	});
    });

    describe('queue deleted notification', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps}
					  onSelectQueue={jest.fn()}
				    />);

	beforeAll(() => {
	    kidsWrapper.instance().loadKidsFromServer();
	});

	it('displays on 410', () => {
	    _.last($.ajax.mock.calls)[0].error({status: 410}, '', '');
	    kidsWrapper.update();
	    expect(kidsWrapper.find('Snackbar[action="Okay"]')
			      .props().open).toBe(true);
	});

	it('should not be dismissable', () => {
	    kidsWrapper.find('Snackbar[action="Okay"]').simulate('requestClose');
	    kidsWrapper.update();
	    expect(kidsWrapper.find('Snackbar[action="Okay"]').props().open).toBe(true);
	});

	it('selects home queue on action touch tap', () => {
	    kidsWrapper.find('Snackbar[action="Okay"]').simulate('actionTouchTap');
	    expect(kidsWrapper.instance().props.onSelectQueue).toHaveBeenCalled();
	});
    });
});

describe('queue actions', () => {
    describe('adding to the queue', () => {
	const kidsWrapper = shallow(<Kids {...dummyProps} />);

	beforeEach(() => {
	    kidsWrapper.setState({adding: false});
	});

	it('is allowed when not paused', () => {
	    kidsWrapper.setState({paused: false});
	    kidsWrapper.find('KidsList').simulate('addExpandChange', true);
	    expect(kidsWrapper.state().adding).toBe(true);
	    kidsWrapper.find('KidsList').simulate('addExpandChange', false);
	    expect(kidsWrapper.state().adding).toBe(false);
	});

	it('is not allowed when paused', () => {
	    kidsWrapper.setState({paused: true});
	    kidsWrapper.find('KidsList').simulate('addExpandChange', true);
	    expect(kidsWrapper.state().adding).toBe(false);
	    kidsWrapper.find('KidsList').simulate('addExpandChange', false);
	    expect(kidsWrapper.state().adding).toBe(false);
	});

	it('happens on handle add open', () => {
	    kidsWrapper.find('FloatingActionButton')
		       .simulate('touchTap');
	    expect(kidsWrapper.state().adding).toBe(true);
	});

	it('closes on handle add reduce change', () => {
	    kidsWrapper.find('FloatingActionButton')
		       .simulate('touchTap');
	    kidsWrapper.find('KidsList')
		       .simulate('addReduceChange');
	    expect(kidsWrapper.state().adding).toBe(false);
	});
    });

    describe('load kids from server', () => {
	beforeAll(() => {
	    jest.useFakeTimers();
	    $.ajax.mockImplementation((request) => {
		return {abort: jest.fn()};
	    });
	});

	beforeEach(() => {
	    jest.clearAllMocks();
	    jest.clearAllTimers();
	});

	describe('xhr', () => {
	    const kidsWrapper = shallow(<Kids {...dummyProps} />);

	    it('aborts previous xhr', () => {
		kidsWrapper.instance().loadKidsFromServer();
		let pendingXhr = kidsWrapper.instance().pendingXhr;
		kidsWrapper.instance().loadKidsFromServer();
		expect(pendingXhr.abort).toHaveBeenCalled();
	    });

	    it('clears pending xhr when request returns', () => {
		kidsWrapper.instance().loadKidsFromServer();
		expect(kidsWrapper.instance().pendingXhr).not.toBe(null);
		_.last($.ajax.mock.calls)[0].success(testResponse.empty);
		expect(kidsWrapper.instance().pendingXhr).toBe(null);
		kidsWrapper.instance().loadKidsFromServer();
		expect(kidsWrapper.instance().pendingXhr).not.toBe(null);
		_.last($.ajax.mock.calls)[0].error({status: 0}, '', '');
		expect(kidsWrapper.instance().pendingXhr).toBe(null);
	    });
	});

	describe('updating queue', () => {
	    const kidsWrapper = shallow(<Kids {...dummyProps} />);

	    it('happens under normal conditions', () => {
		kidsWrapper.instance().loadKidsFromServer();
		_.last($.ajax.mock.calls)[0].success(testResponse.empty);
		expect(kidsWrapper.state().data).toEqual(testData.empty);
		kidsWrapper.instance().loadKidsFromServer();
		_.last($.ajax.mock.calls)[0].success(testResponse.short);
		expect(kidsWrapper.state().data).toEqual(testData.short);
		kidsWrapper.instance().loadKidsFromServer();
		_.last($.ajax.mock.calls)[0].success(testResponse.long);
		expect(kidsWrapper.state().data).toEqual(testData.long);
	    });

	    it('does not happen when a different queue is selected', () => {
		kidsWrapper.instance().loadKidsFromServer();
		_.last($.ajax.mock.calls)[0].success(testResponse.empty);
		kidsWrapper.instance().loadKidsFromServer();

		let newQueueId = kidsWrapper.instance().props.queueId + 1;
		selectQueue(kidsWrapper, newQueueId, 'queue');

		_.last($.ajax.mock.calls)[0].success(testResponse.short);
		expect(kidsWrapper.state().data).toEqual(testData.empty);
		kidsWrapper.instance().loadKidsFromServer();

		newQueueId = kidsWrapper.instance().props.queueId + 1;
		selectQueue(kidsWrapper, newQueueId, 'queue');

		_.last($.ajax.mock.calls)[0].success(testResponse.long);
		expect(kidsWrapper.state().data).toEqual(testData.empty);
	    });
	});

	describe('connection', () => {
	    const kidsWrapper = shallow(<Kids {...dummyProps} />);
	    const errorCodes = [404, 500];

	    it('is maintained on successful ajax', () => {
		kidsWrapper.instance().loadKidsFromServer();
		_.last($.ajax.mock.calls)[0].success(testResponse.short);
		expect(setTimeout).toHaveBeenCalled();
		jest.runOnlyPendingTimers();
		$.ajax.mock.calls[1][0].success(testResponse.long);
		expect(setTimeout).toHaveBeenCalledTimes(2);
		expect(setTimeout.mock.calls[1][0])
		    .toBe(kidsWrapper.instance().loadKidsFromServer);
	    });

	    _.each(errorCodes, (errorCode) => {
		it(`is maintained on ${errorCode}`, () => {
		    kidsWrapper.instance().loadKidsFromServer();
		    _.last($.ajax.mock.calls)[0].error({status: errorCode}, '', '');
		    expect(setTimeout).toHaveBeenCalled();
		    jest.runOnlyPendingTimers();
		    _.last($.ajax.mock.calls)[0].error({status: errorCode}, '', '');
		    expect(setTimeout).toHaveBeenCalledTimes(2);
		    expect(setTimeout.mock.calls[1][0])
			.toBe(kidsWrapper.instance().loadKidsFromServer);
		});
	    });

	    it('does not leak on multiple calls', () => {
		_.times(10, kidsWrapper.instance().loadKidsFromServer);

		_.each($.ajax.mock.calls, (call, index) => {
		    if (index % 2) {
			call[0].error({status: 404}, '', '');
		    }
		    else {
			call[0].success(testResponse.short);
		    }
		});

		$.ajax.mockClear();
		jest.runOnlyPendingTimers();

		expect($.ajax).toHaveBeenCalledTimes(1);
	    });
	});
    });
});

describe('Life cycle', () => {
    const UnrenderedKids = require('../../src/app/Kids/Kids').default;

    beforeAll(() => {
	UnrenderedKids.prototype.render = () => {
	    return <div />;
	};

	$.ajax.mockImplementation((request) => {
	    return {abort: jest.fn()};
	});

	window.addEventListener = jest.fn();
	window.removeEventListener = jest.fn();
    });

    beforeEach(() => {
	jest.clearAllMocks();
	jest.clearAllTimers();
    });

    describe('connection', () => {
	it('establishes on mount', () => {
	    const unKidsWrapper = mount(<UnrenderedKids {...dummyProps} />);
	    expect($.ajax).toHaveBeenCalled();
	    _.last($.ajax.mock.calls)[0].success(testResponse.empty);
	    expect(setTimeout.mock.calls[0][0])
		.toBe(unKidsWrapper.instance().loadKidsFromServer);
	});

	it('does not leak on change queue', () => {
	    const unKidsWrapper = mount(<UnrenderedKids {...dummyProps} />);
	    let newQueueId;

	    _.times(10, () => {
		newQueueId = unKidsWrapper.instance().props.queueId + 1;
		selectQueue(unKidsWrapper, newQueueId, 'queue');
	    });

	    _.each($.ajax.mock.calls, (call, index) => {
		if (index % 2) {
		    call[0].error({status: 404}, '', '');
		}
		else {
		    call[0].success(testResponse.short);
		}
	    });

	    $.ajax.mockClear();
	    jest.runOnlyPendingTimers();

	    expect($.ajax).toHaveBeenCalledTimes(1);
	});

	it('refreshes on toggle refresh', () => {
	    const unKidsWrapper = mount(<UnrenderedKids {...dummyProps} />);
	    unKidsWrapper.instance().loadKidsFromServer = jest.fn();
	    unKidsWrapper.setProps({refresh: !unKidsWrapper.instance().props.refresh});
	    jest.runOnlyPendingTimers();
	    expect(unKidsWrapper.instance().loadKidsFromServer).toHaveBeenCalled();
	});
    });

    describe('clean up', () => {
	let unKidsWrapper;
	let unKidsWrapperInstance;

	beforeAll(() => {
	    jest.useFakeTimers();
	});

	beforeEach(() => {
	    unKidsWrapper = mount(<UnrenderedKids {...dummyProps} />);
	    unKidsWrapperInstance = unKidsWrapper.instance();
	    unKidsWrapper.unmount();
	});

	it('adds window event handler on mount', () => {
	    expect(window.addEventListener)
		.toHaveBeenCalledWith('beforeunload',
				      unKidsWrapperInstance.handleWindowClose);
	});

	it('clears all timers', () => {
	    expect(clearTimeout)
		.toHaveBeenCalledTimes(_.size(unKidsWrapperInstance.timerIds));
	});

	it('aborts pending xhr request', () => {
	    expect(unKidsWrapperInstance.pendingXhr.abort).toHaveBeenCalled();
	});

	it('removes window event handler', () => {
	    expect(window.removeEventListener)
		.toHaveBeenCalledWith('beforeunload',
				      unKidsWrapperInstance.handleWindowClose);
	});
    });
});
