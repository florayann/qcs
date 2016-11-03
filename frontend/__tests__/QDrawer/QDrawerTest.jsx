import React from 'react';
import {shallow} from 'enzyme';
import QDrawer from '../../src/app/QDrawer/QDrawer';
import _ from 'underscore';

jest.unmock('../../src/app/QDrawer/QDrawer');

describe('QDrawer operations', () => {
    const qDrawerWrapper = shallow(<QDrawer classes={{}}
					    onSelectQueue={() => {}}
					    onRequestChange={jest.fn()}
					    open={false}
					    url="/queue/"
					    queueId="1"
					    instructor={false}
				   />);
    it('handles request change', () => {
	qDrawerWrapper.find('Drawer').simulate('requestChange');
	expect(qDrawerWrapper.instance().props.onRequestChange).toHaveBeenCalled();
    });

    it('has ClassList with correct number of QClasses', () => {
	qDrawerWrapper.setProps({
	    classes: {
		1: 'CS 233',
		2: 'CS 421',
		3: 'CS 403',
	    },
	});
	let classListWrapper = qDrawerWrapper.find('ClassList').shallow();
	expect(classListWrapper.find('QClass').length)
	    .toBe(_.size(qDrawerWrapper.instance().props.classes));
    });

    it('shows QControls when instructor', () => {
	expect(qDrawerWrapper.find('QControls').length).toBe(0);
	qDrawerWrapper.setProps({instructor: true});
	qDrawerWrapper.update();
	expect(qDrawerWrapper.find('QControls').length).toBe(1);
    });
});
