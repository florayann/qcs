import React from 'react';
import {shallow} from 'enzyme';
import IconButton from 'material-ui/IconButton';
import Announcement from '../../src/app/Kids/Announcement';

jest.unmock('../../src/app/Kids/Announcement');

describe('appearance', () => {
    const muiTheme = {palette: {accent1Color: ''}};

    it('does not show delete button for students', () => {
	const announcement = shallow(<Announcement instructor={false}
						   message="hi"
						   onRemove={() => {}}
						   muiTheme={muiTheme}
				     />);
	expect(announcement.find('ListItem').props().rightIconButton).toEqual(null);
    });

    it('does shows delete button for instructors', () => {
	const announcement = shallow(<Announcement instructor={true}
						   message="hi"
						   onRemove={() => {}}
						   muiTheme={muiTheme}
				     />);
	expect(announcement.find('ListItem').props().rightIconButton.type)
	    .toBe(IconButton);
    });
});
