import React from 'react';
import {shallow} from 'enzyme';
import QClass from '../../src/app/QDrawer/QClass';
import $ from 'jquery';
import _ from 'underscore';

jest.unmock('../../src/app/QDrawer/QClass');

const dummyProps = {
    onSelectQueue: () => {},
    drawerOpen: false,
    url: '/class/1',
    name: 'CS 233',
    classId: '1',
};

describe('queue list', () => {
    const qClassWrapper = shallow(<QClass {...dummyProps} />);

    beforeAll(() => {
	qClassWrapper.setState({
	    queues: {
		1: 'test queue',
		2: 'Office hours',
	    },
	});
	qClassWrapper.update();
    });

    it('shows correct number of queues', () => {
	expect(qClassWrapper.find('ListItem').props().nestedItems.length)
	    .toBe(_.size(qClassWrapper.state().queues));
    });

    it('shows new queue button when instructor', () => {
	qClassWrapper.instance().handleAddQueue('');
	_.last($.ajax.mock.calls)[0].success({});
	qClassWrapper.update();
	expect(qClassWrapper.find('ListItem').props().nestedItems.length)
	    .toBe(_.size(qClassWrapper.state().queues) + 1);
    });
});

describe('event handlers', () => {
    describe('handle add queue', () => {
	it('opens dialog', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.instance().handleOpen();
	    qClassWrapper.update();
	    let addQueueDialogWrapper = qClassWrapper.find('AddQueueDialog').shallow();
	    expect(addQueueDialogWrapper.find('Dialog').props().open).toBe(true);
	});

	it('elevates to instructor status', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);

	    qClassWrapper.instance().handleAddQueue('');
	    _.last($.ajax.mock.calls)[0].success({});
	    expect(qClassWrapper.state().instructor).toBe(true);
	});

	it('lowers to student only on 403', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.setState({instructor: true});
	    qClassWrapper.instance().handleAddQueue('');
	    _.last($.ajax.mock.calls)[0].error({status: 404});
	    expect(qClassWrapper.state().instructor).toBe(true);
	    qClassWrapper.instance().handleAddQueue('');
	    _.last($.ajax.mock.calls)[0].error({status: 403});
	    expect(qClassWrapper.state().instructor).toBe(false);
	});

	it('switches to the new queue if added', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps}
						  onSelectQueue={jest.fn()}
					  />);
	    qClassWrapper.instance().handleAddClose = jest.fn();
	    qClassWrapper.find('AddQueueDialog').simulate('submit', 'test queue');
	    _.last($.ajax.mock.calls)[0].success({1: 'test queue'});
	    expect(qClassWrapper.instance().props.onSelectQueue)
		.toHaveBeenCalledWith('1', 'test queue');
	    expect(qClassWrapper.instance().handleAddClose).toHaveBeenCalled();
	});

	it('handles submission', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.find('AddQueueDialog').simulate('keypress', {
		keyCode: 14,
		which: 14,
		charCode: 14,
		key: "not enter",

	    });
	    qClassWrapper.find('AddQueueDialog').simulate('keypress', {
		keyCode: 13,
		which: 13,
		charCode: 13,
		key: "enter",

	    });
	    _.last($.ajax.mock.calls)[0].success({});
	    expect(qClassWrapper.state().instructor).toBe(true);
	});
    });

    describe('handle delete queue', () => {
	it('opens dialog', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.instance().confirmDelete();
	    qClassWrapper.update();
	    let deleteQueueDialogWrapper = qClassWrapper
		.find('DeleteQueueDialog').shallow();
	    expect(deleteQueueDialogWrapper.find('Dialog').props().open).toBe(true);
	});

	it('closes dialog on successful delete', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.instance().confirmDelete();
	    qClassWrapper.update();
	    qClassWrapper.find('DeleteQueueDialog').simulate('confirmDelete');
	    _.last($.ajax.mock.calls)[0].success({});
	    qClassWrapper.update();
	    let deleteQueueDialogWrapper = qClassWrapper
		.find('DeleteQueueDialog').shallow();
	    expect(deleteQueueDialogWrapper.find('Dialog').props().open).toBe(false);
	});
    });

    it('handles name change', () => {
	const qClassWrapper = shallow(<QClass {...dummyProps} />);
	qClassWrapper.find('AddQueueDialog').simulate('nameChange',
						      {target: {value: 'hi'}});
	expect(qClassWrapper.state().name).toBe('hi');
    });

    it('handles nested list toggle', () => {
	const qClassWrapper = shallow(<QClass {...dummyProps} />);
	qClassWrapper.instance().handleAddQueue = jest.fn();
	qClassWrapper.instance().handleNestedListToggle({state: {open: false}});
	qClassWrapper.instance().handleNestedListToggle({state: {open: true}});
	expect(qClassWrapper.instance().handleAddQueue).toHaveBeenCalledTimes(1);
    });

    describe('load queues from server', () => {
	beforeAll(() => {
	    jest.useFakeTimers();
	});

	beforeEach(() => {
	    jest.clearAllMocks();
	});

	it('loads queues on drawer open', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.setProps({drawerOpen: true});
	    qClassWrapper.instance().componentDidUpdate(dummyProps);
	    _.last($.ajax.mock.calls)[0].success({});
	    expect(setTimeout.mock.calls[0][0])
		.toBe(qClassWrapper.instance().loadQueuesFromServer);
	});

	it('does not load when drawer closed', () => {
	    const qClassWrapper = shallow(<QClass {...dummyProps} />);
	    qClassWrapper.instance().loadQueuesFromServer();
	    _.last($.ajax.mock.calls)[0].success({});
	    expect(setTimeout).not.toHaveBeenCalled();
	});
    });
});

describe('action buttons', () => {
    it('select queue button', () => {
	const qClassWrapper = shallow(<QClass {...dummyProps}
					      onSelectQueue={jest.fn()}
				      />);
	qClassWrapper.setState({
	    queues: {
		1: 'office hours',
	    },
	});

	qClassWrapper.find('ListItem').props().nestedItems[0].props.onTouchTap();
	expect(qClassWrapper.instance().props.onSelectQueue)
	    .toHaveBeenCalledWith('1', 'office hours');
    });

    it('delete queue button', () => {
	const qClassWrapper = shallow(<QClass {...dummyProps} />);
	qClassWrapper.instance().confirmDelete = jest.fn();
	qClassWrapper.setState({
	    instructor: true,
	    queues: {
		1: 'office hours',
	    },
	});
	qClassWrapper.update();
	qClassWrapper.find('ListItem').props().nestedItems[0].props
		     .rightIconButton.props.onTouchTap();
	expect(qClassWrapper.instance().confirmDelete).toHaveBeenCalled();
    });

    it('add queue dialog button', () => {
	const qClassWrapper = shallow(<QClass {...dummyProps}
				      />);
	qClassWrapper.instance().handleAddQueue = jest.fn();
	qClassWrapper.setState({name: 'tester'});
	qClassWrapper.update();
	let addQueueDialogWrapper = qClassWrapper.find('AddQueueDialog').shallow();
	addQueueDialogWrapper.find('Dialog').props().actions[1].props.onTouchTap();
	expect(qClassWrapper.instance().handleAddQueue).toHaveBeenCalledWith('tester');
    });
});
