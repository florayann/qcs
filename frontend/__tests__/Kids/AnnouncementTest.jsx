import React from 'react';
import {shallow} from 'enzyme';
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
});
