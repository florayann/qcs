import React from 'react';
import {shallow} from 'enzyme';
import QControls from '../../src/app/QDrawer/QControls';
import $ from 'jquery';
import _ from 'underscore';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import PauseArrow from 'material-ui/svg-icons/av/pause';

jest.unmock('../../src/app/QDrawer/QControls');

describe('QControls', () => {
    describe('request handling', () => {
	const qControlsWrapper = shallow(<QControls url="/queue/info/1"
						    queue_url="queue/1"
					 />);
	it('sets paused state on read', () => {
	    qControlsWrapper.instance().componentDidMount();
	    _.last($.ajax.mock.calls)[0].success({paused: true});
	    expect(qControlsWrapper.state().paused).toBe(true);
	    qControlsWrapper.instance().loadQueueInfo();
	    _.last($.ajax.mock.calls)[0].success({paused: false});
	    expect(qControlsWrapper.state().paused).toBe(false);
	});

	it('toggles paused state correctly on write', () => {
	    qControlsWrapper.setState({paused: false});
	    qControlsWrapper.find('PlayPauseButton').simulate('pauseToggle');
	    expect(_.last($.ajax.mock.calls)[0].type).toBe('DELETE');
	    _.last($.ajax.mock.calls)[0].success({paused: true});
	    qControlsWrapper.find('PlayPauseButton').simulate('pauseToggle');
	    expect(_.last($.ajax.mock.calls)[0].type).toBe('POST');
	    _.last($.ajax.mock.calls)[0].success({paused: false});
	});

	it('changes play pause button appearance on toggle', () => {
	    qControlsWrapper.setState({paused: false});
	    qControlsWrapper.update();
	    let playPauseButtonWrapper = qControlsWrapper.find('PlayPauseButton').shallow();
	    expect(playPauseButtonWrapper.find('ListItem').props().primaryText)
		.toBe('Pause');
	    expect(playPauseButtonWrapper.find('ListItem').props().leftIcon.type)
		.toBe(PauseArrow);
	    qControlsWrapper.setState({paused: true});
	    qControlsWrapper.update();
	    playPauseButtonWrapper = qControlsWrapper.find('PlayPauseButton').shallow();
	    expect(playPauseButtonWrapper.find('ListItem').props().primaryText)
		.toBe('Resume');
	    expect(playPauseButtonWrapper.find('ListItem').props().leftIcon.type)
		.toBe(PlayArrow);
	});
    });
});
