import Link from 'next/link';
import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from './Cart';
import { Query, Mutation } from 'react-apollo';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';
import Orders from './Order';


const Nav = () => (
<User>
    {({ data: { me } }) => (
    <NavStyles data-test="nav">
        <Link href="/items">
            <a>BUY</a>
        </Link>
        {me && (
            <>
                <Link href="/sell">
                    <a>Sell</a>
                </Link>
                <Link href="/orders">
                    <a>Orders</a>
                </Link>
                <Link href="/account">
                    <a>Account</a>
                </Link>
                <Signout/>
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                    {(toggleCart) => (
                        <button onClick={toggleCart}>
                            My Cart
                            <CartCount count={me.cart.reduce((tally, cartItem) => tally+cartItem.quantity,0)}></CartCount>
                        </button>
                    )}
                </Mutation>
            </>
        )}
        {!me && (
            <Link href="/signup">
                <a>Sign In</a>
            </Link>
        )}
    </NavStyles>
    )}
</User>
);

export default Nav;