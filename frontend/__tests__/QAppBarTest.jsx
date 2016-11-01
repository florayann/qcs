import React from 'react';
import {shallow} from 'enzyme';
import QAppBar from '../src/app/QAppBar';

jest.unmock('../src/app/QAppBar');
jest.mock('material-ui/AppBar');

describe('app bar operations', () => {
    const refresh = jest.fn();
    const logout = jest.fn();

    it('mounts', () => {
	shallow(<QAppBar queueName=""
			 onRefresh={refresh}
			 onLogout={logout}
			 onLeftIconButtonTouchTap={logout}
		/>
	);
    });
});
