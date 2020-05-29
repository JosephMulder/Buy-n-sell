import { mount } from 'enzyme';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import toJSON from 'enzyme-to-json';
import { func } from 'prop-types';
import Router from 'next/router';
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';

const mocks = [
    {
      request: {
        query: REQUEST_RESET_MUTATION,
        variables: { email: 'josephmulder800@gmail.com' },
      },
      result: {
        data: { requestReset: { message: 'success', __typename: 'Message' } },
      },
    },
  ];

describe('<RequestReset/>', () => {
    it('renders and matches snapshot', async () => {
        const wrapper = mount(
            <MockedProvider>
                <RequestReset/>
            </MockedProvider>
        );
        const form = wrapper.find('form[data-test="form"]');
        // console.log(form.debug());
        expect(toJSON(form)).toMatchSnapshot();
    });

    it('calls the mutation', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
              <RequestReset />
            </MockedProvider>
          );
          // simulate typing an email
          wrapper.find('input').simulate('change', { target: { name: 'email', value: 'josephmulder800@gmail.com' } });
          // submit the form
          wrapper.find('form').simulate('submit');
          await wait();
          wrapper.update();
          // expect(wrapper.find('p').text()).toContain('Check email for reset link');
        //   expect(wrapper.find('p').text()).toContain('Check email for reset link');
    });
});