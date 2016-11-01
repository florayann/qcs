import React from 'react';
import {shallow} from 'enzyme';
import AddKid from '../../src/app/Kids/AddKid';

jest.unmock('../../src/app/Kids/AddKid');

function hitEnter(wrapper) {
    wrapper.simulate('keyPress', {
        keyCode: 13,
        which: 13,
	charCode: 13,
        key: "enter",

    });
}

describe('verify inputs', () => {
    const kidSubmit = jest.fn();
    const addKid = shallow(<AddKid adding={false}
				   editing={true}
				   onAddExpandChange={() => {}}
				   onAddReduceChange={() => {}}
				   onKidSubmit={kidSubmit}
				   paused={false}
			   />);

    beforeEach(() => {
	jest.clearAllMocks();
    });

    describe('name', () => {
	it('does not submit but produces error text when empty', () => {
	    hitEnter(addKid.find('TextField[hintText="Name"]'));
	    expect(kidSubmit).not.toHaveBeenCalled();
	    addKid.update();
	    expect(addKid.find('TextField[hintText="Name"]')
		.props().errorText).toEqual('This field is required');
	});

	it('changes on input', () => {
	    addKid.find('TextField[hintText="Name"]')
		  .simulate('change', {target: {value: 'user'}});
	    expect(addKid.state().name).toEqual('user');
	});
    });

    describe('room', () => {
	it('does not submit but produces error text when empty', () => {
	    hitEnter(addKid.find('TextField[hintText="Room"]'));
	    expect(kidSubmit).not.toHaveBeenCalled();
	    addKid.update();
	    expect(addKid.find('TextField[hintText="Room"]')
			 .props().errorText).toEqual('This field is required');
	});

	it('changes on input', () => {
	    addKid.find('TextField[hintText="Room"]')
		  .simulate('change', {target: {value: 'room'}});
	    expect(addKid.state().room).toEqual('room');
	});
    });

    describe('question', () => {
	it('does not submit but produces error text when empty', () => {
	    hitEnter(addKid.find('TextField[hintText="Question"]'));
	    expect(kidSubmit).not.toHaveBeenCalled();
	    addKid.update();
	    expect(addKid.find('TextField[hintText="Question"]')
			 .props().errorText).toEqual('This field is required');
	});

	it('changes on input', () => {
	    addKid.find('TextField[hintText="Question"]')
		  .simulate('change', {target: {value: 'question?'}});
	    expect(addKid.state().question).toEqual('question?');
	});
    });

    describe('all', () => {
	it('does not submit when empty', () => {
	    addKid.setState({name: "", room: "", question: ""});
	    hitEnter(addKid.find('TextField[hintText="Name"]'));
	    hitEnter(addKid.find('TextField[hintText="Room"]'));
	    hitEnter(addKid.find('TextField[hintText="Question"]'));
	    expect(kidSubmit).not.toHaveBeenCalled();
	});

	it('submits when filled out', () => {
	    addKid.setState({name: "user", room: "room", question: "question?"});
	    hitEnter(addKid.find('TextField[hintText="Question"]'));
	    expect(kidSubmit).toHaveBeenCalled();
	});
    });
});

describe('user experience', () => {
    describe('submission', () => {
	const kidSubmit = jest.fn();
	const addReduceChange = jest.fn();
	const addKid = shallow(<AddKid adding={false}
				       editing={true}
				       onAddExpandChange={() => {}}
				       onAddReduceChange={addReduceChange}
				       onKidSubmit={kidSubmit}
				       paused={false}
			       />);
	beforeAll(() => {
	    hitEnter(addKid.find('TextField[hintText="Room"]'));
	    addKid.setState({name: "user ", room: "room  ", question: "question?  "});
	    addKid.instance().submitKid();
	});

	it('trims submission', () => {
	    addKid.instance().submitKid();
	    expect(kidSubmit).toHaveBeenCalled();
	    expect(kidSubmit.mock.calls[0][0]).toEqual({name: "user",
							room: "room",
							question: "question?",
	    });
	});

	it('resets room and question while preserving name', () => {
	    expect(addKid.state().name).toBe("user ");
	    expect(addKid.state().room).toBe("");
	    expect(addKid.state().question).toBe("");
	});

	it('closes itself', () => {
	    expect(addReduceChange).toHaveBeenCalled();
	});

	it('clears error text', () => {
	    expect(addKid.find('TextField[hintText="Name"]').props().errorText)
		.toEqual('');
	    expect(addKid.find('TextField[hintText="Room"]').props().errorText)
		.toEqual('');
	    expect(addKid.find('TextField[hintText="Question"]').props().errorText)
		.toEqual('');
	});
    });
});
