import React from 'react';
import {shallow} from 'enzyme';
import FakeAuthDialog from '../src/app/FakeAuthDialog';

jest.unmock('../src/app/FakeAuthDialog');

describe('fake auth dialog', () => {
    it('rejects empty input', () =>{
	const authDialog = shallow(<FakeAuthDialog onLogin={() => {}} />);
	expect(authDialog.state().username).toEqual('');
	authDialog.instance().handleLogin();
	authDialog.update();
	expect(authDialog.state().attemptedSubmit).toBeTruthy();
	expect(authDialog.find('TextField').props().errorText)
	    .toEqual('This field is required');
    });

    it('accepts valid username', () => {
	let result;
	const authDialog = shallow(<FakeAuthDialog onLogin={(data) => {
		result = data;
	    }} />);
	authDialog.find('TextField').simulate('change', {target: {value: 'tfliu2'}});
	expect(authDialog.state().username).toEqual('tfliu2');
	authDialog.find('TextField').simulate('keyPress', {
            keyCode: 13,
            which: 13,
	    charCode: 13,
            key: "enter",

        });
	expect(result).toEqual({username: 'tfliu2'});
    });
});
