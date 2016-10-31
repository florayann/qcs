import React from 'react';
import {shallow} from 'enzyme';
import App from '../src/app/app';
import $ from 'jquery';

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
    });

    it('updates queue info properly', () => {
	app.instance().handleSelectQueue('1', 'CS 233');
	expect(app.state().queueName).toEqual('CS 233');
	expect(app.state().queueId).toEqual('1');
	expect(app.state().queueInstructor).toEqual(true);
    });

    it('toggles refresh', () => {
	let r = app.state().refresh;
	app.instance().handleRefresh();
	expect(app.state().refresh).toEqual(!r);
    });
});

describe('request failure handling', () => {
    const app = shallow(<App class_url="/classes"
			     queue_url="/queue/"
			     queues_url="/class/"
			     login_url="/auth"
			/>);

    it('marks as not instructor on 403', () => {
	app.setState({queueInstructor: true});
	app.instance().handleSelectQueue('1', 'CS 233');
	$.ajax.mock.calls[0][0].error({status: 403});
	expect(app.state().queueInstructor).toEqual(false);
    });
});

