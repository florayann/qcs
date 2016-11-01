import React from 'react';
import {mount, shallow} from 'enzyme';
import Kids from '../../src/app/Kids/Kids';
import testData from './TestData';
import _ from 'underscore';

jest.unmock('../../src/app/Kids/Kids');
jest.unmock('./TestData');
jest.unmock('react-document-title');

const dummyProps = {
    instructor: false,
    onSelectQueue: () => {},
    queueId: '1',
    queueName: 'CS 233',
    refresh: false,
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
	    console.log(kidsWrapper.props());
	});

	it('resets to q.cs when no queue selected', () => {
	    kidsWrapper.setProps({queueId: '0'});
	    expect(kidsWrapper.instance().getDocumentTitle()).toBe('q.cs');
	});

	it('displays only the queue name when queue is empty', () => {
	    kidsWrapper.setState({data: testData.empty});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(kidsWrapper.props().queueName);
	});

	it('displays number of people on queue when not empty', () => {
	    kidsWrapper.setState({data: testData.short});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.short.length}) ${kidsWrapper.props().queueName}`);
	    kidsWrapper.setState({data: testData.long});
	    expect(kidsWrapper.instance().getDocumentTitle())
		.toBe(`(${testData.long.length}) ${kidsWrapper.props().queueName}`);
	});
    });
});
