import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import PleaseSignin from '../components/PleaseSignin';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';
import {CURRENT_USER_QUERY} from '../components/User';
import { tr } from 'date-fns/locale';

const notSignedInMocks = [
    {
        request: { query: CURRENT_USER_QUERY},
        result: { data: {me: null}},
    },
];
const signedInMocks = [
    {
        request: { query: CURRENT_USER_QUERY},
        result: { data: {me: fakeUser()}},
    },
];

describe('<PleaseSignin/>', () => {
    it('renders the sign in diaglog to logged out users', async () => {
        const wrapper = mount(
            <MockedProvider mocks={notSignedInMocks}>
                <PleaseSignin/>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.text()).toContain('Please sign in!');
        // console.log(wrapper.debug()); 
        expect(wrapper.find('Signin').exists()).toBe(true);
    });

    it('render the child component when the user is signed in', async () => {
        const ChildComponent = () => <p>child component</p>;
        const wrapper = mount(
            <MockedProvider mocks={signedInMocks}>
                <PleaseSignin>
                    <ChildComponent/>
                </PleaseSignin>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('ChildComponent').exists()).toBe(true);
        // console.log(wrapper.debug());
        expect(wrapper.contains(<ChildComponent/>)).toBe(true);
    });
});