import React from 'react';
import {shallow, mount} from 'enzyme';
import App from '../src/app/app';
import $ from 'jquery';
import sinon from 'sinon';

jest.unmock('../src/app/app');

describe('select queue', () => {
    const app = shallow(<App class_url="/classes"
			     queue_url="/queue/"
			     queues_url="/class/"
			     login_url="/auth"
			/>);

    beforeAll(() => {
	let appInstance = app.instance();
	appInstance.isQueueInstructor = function (queueId) {
	    this.setState({queueInstructor: queueId === '1'});
	}.bind(appInstance);
	app.setState({username: 'tfliu2'});
    });

    it('starts off empty', () => {
	expect(app.state().username).toEqual('tfliu2');
	expect(app.state().queueInstructor).toEqual(false);
	app.instance().handleSelectQueue();
	expect(app.state().queueName).toEqual('q.cs');
	expect(app.state().queueId).toEqual('0');
	expect(app.state().queueInstructor).toEqual(false);
	app.update();
	expect(app.find('ReactTimeout').length).toBe(0);
    });

    it('updates queue info properly', () => {
	app.instance().handleSelectQueue('1', 'CS 233');
	expect(app.state().queueName).toEqual('CS 233');
	expect(app.state().queueId).toEqual('1');
	expect(app.state().queueInstructor).toEqual(true);
	app.update();
	expect(app.find('Kids').length).not.toBe(0);
    });

    it('toggles refresh', () => {
	let r = app.state().refresh;
	app.instance().handleRefresh();
	expect(app.state().refresh).toEqual(!r);
    });
});

describe('request handling', () => {
    afterEach(() => {
	jest.clearAllMocks();
    });

    it('marks as not instructor on 403', () => {
	const app = shallow(<App class_url="/classes"
				 queue_url="/queue/"
				 queues_url="/class/"
				 login_url="/auth"
			    />);
	app.setState({queueInstructor: true});
	app.instance().handleSelectQueue('1', 'CS 233');
	$.ajax.mock.calls[0][0].error({status: 403});
	expect(app.state().queueInstructor).toEqual(false);
    });

    it('retries loading classes if disconnected', () => {
	sinon.spy(App.prototype, 'componentDidMount');
	const app = mount(<App class_url="/classes"
			       queue_url="/queue/"
			       queues_url="/class/"
			       login_url="/auth"
			  />);
	jest.useFakeTimers();
	expect(App.prototype.componentDidMount.calledOnce).toEqual(true);
	$.ajax.mock.calls[0][0].success('user');
	$.ajax.mock.calls[1][0].error({status: 404}, 'error', 'Not Found');
	expect(setTimeout.mock.calls.length).toBe(1);
	jest.runOnlyPendingTimers();
	$.ajax.mock.calls[2][0].error({status: 404}, 'error', 'Not Found');
	expect(setTimeout.mock.calls.length).toBe(2);
	jest.runOnlyPendingTimers();
	$.ajax.mock.calls[2][0].success({1: 'CS 233', 2: 'CS 421'});
	expect(app.state().classes).toEqual({1: 'CS 233', 2: 'CS 421'});
    });

    it('logs in and logs out', () => {
	const app = shallow(<App class_url="/classes"
				 queue_url="/queue/"
				 queues_url="/class/"
				 login_url="/auth"
			    />);
	app.instance().handleLogin('user');
	$.ajax.mock.calls[0][0].success('user');
	expect(app.find('QAppBar').length).toBe(1);
	app.instance().handleLogout();
	$.ajax.mock.calls[1][0].success();
	expect(app.state().username).toBe(null);
	app.update();
	expect(app.find('QAppBar').length).toBe(0);
    });
});

describe('interface handling', () => {
    it('opens drawer on left icon touch tap', () => {
	const app = shallow(<App class_url="/classes"
			       queue_url="/queue/"
			       queues_url="/class/"
			       login_url="/auth"
			  />);
	app.instance().handleLeftIconButtonTouchTap();
	app.update();
	expect(app.find('QDrawer').first().props().open).toBeTruthy();
    });
});

