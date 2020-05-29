import { mount } from 'enzyme';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import toJSON from 'enzyme-to-json';
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';
import { func } from 'prop-types';
import Router from 'next/router';

Router.router = {
    push() {}, // setting methods used by next/router to nothing so they don't error
    prefetch() {},
};

function makeMocksFor(length) {
    return [
        {
            request: {query: PAGINATION_QUERY },
            result: {
                data: {
                    itemsConnection: {
                        __typename: 'aggregate',
                        aggregate: {
                            __typename: 'count',
                            count: length,
                        }
                    }
                }
            }
        }
    ];
};

describe('Pagination/>',  () => {
    it('displays a loading message', () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(1)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        expect(wrapper.text()).toContain('Loading...');
    });

    it('renders pagination for 18 items', async() => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('.totalPages').text()).toEqual('5');
        const pagination = wrapper.find('[data-test="pagination"]');
        expect(toJSON(pagination)).toMatchSnapshot();
        // console.log(wrapper.debug());
    });

    // On the pagination page the next and previous buttons only work if there
    // are pages to go back on or foward to.. These tests check if that fn works
    it('disables prev button on first page', async() => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        // console.log(wrapper.find('a.prev').debug());
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(true);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
    });

    it('disables next button on last page', async() => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={5} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        // console.log(wrapper.find('a.prev').debug());
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(true);
    });

    it('enables all buttons on middle page', async() => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={3} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
    });
})