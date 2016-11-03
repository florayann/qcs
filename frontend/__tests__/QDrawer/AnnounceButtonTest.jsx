import React from 'react';
import {shallow} from 'enzyme';
import AnnounceButton from '../../src/app/QDrawer/AnnounceButton';
import $ from 'jquery';
import _ from 'underscore';

jest.unmock('../../src/app/QDrawer/AnnounceButton');

describe('event handlers', () => {
    const announceButtonWrapper = shallow(<AnnounceButton url="/queue/1"/>);

    it('handles open', () => {
	announceButtonWrapper.find('ListItem').simulate('touchTap');
	announceButtonWrapper.update();
	expect(announceButtonWrapper.find('Dialog').props().open).toBe(true);
    });

    it('handles message change', () => {
	announceButtonWrapper.find('TextField').simulate('change', {
	    target: {value: 'hello'}});
	announceButtonWrapper.update();
	expect(announceButtonWrapper.find('TextField').props().value)
	    .toBe('hello');
    });

    it('handles submission', () => {
	announceButtonWrapper.find('TextField').simulate('keypress', {
            keyCode: 14,
            which: 14,
	    charCode: 14,
            key: "not enter",

	});
	announceButtonWrapper.find('TextField').simulate('keypress', {
            keyCode: 13,
            which: 13,
	    charCode: 13,
            key: "enter",

	});
	expect(JSON.parse($.ajax.mock.calls[0][0].data).message).toBe('hello');
    });

    it('handles close', () => {
	$.ajax.mock.calls[0][0].success();
	announceButtonWrapper.update();
	expect(announceButtonWrapper.find('Dialog').props().open).toBe(false);
    });
});
