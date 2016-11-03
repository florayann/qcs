import React from 'react';
import {shallow} from 'enzyme';
import QAppBarMenu from '../src/app/QAppBarMenu';

jest.unmock('../src/app/QAppBarMenu');

describe('app bar operations', () => {
    const refresh = jest.fn();
    const logout = jest.fn();

    it('mounts', () => {
	shallow(<QAppBarMenu onRefresh={refresh}
			     onLogout={logout}
		/>
	);
    });
});
