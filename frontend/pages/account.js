import PleaseSignIn from '../components/PleaseSignin';
import Account from '../components/Account';
import OrderList from '../components/OrderList';
import styled from 'styled-components';

const OrderListHeader = styled.h2`
    padding-inline-start: 60px;
`;
const AccountPage = props => (
    <div>
        <PleaseSignIn>
            <Account />
            <OrderListHeader>Orders:</OrderListHeader>
            <OrderList />
        </PleaseSignIn>
    </div>
);
export default AccountPage;