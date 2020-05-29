import PleaseSignIn from '../components/PleaseSignin';
import Account from '../components/Account';
import OrderList from '../components/OrderList';
import styled from 'styled-components';

const AccountPage = props => (
    <div>
        <PleaseSignIn>
            <Account />
            <OrderList />
        </PleaseSignIn>
    </div>
);
export default AccountPage;