import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import styled from 'styled-components';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';
import Error from './ErrorMessage';
import formatDate from '../lib/formatDate';

const USER_ORDERS_QUERY = gql`
    query USER_ORDERS_QUERY {
        orders(orderBy: createdAt_DESC) {
            id
            total
            createdAt
            items {
                id
                title
                price
                description
                quantity
                image
            }
        }
    }
`;

const OrderUl = styled.ul`
    display: grid;
    grid-gap: 4rem;
    grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class OrderList extends React.Component {
    render() {
        return (
            <Query query={USER_ORDERS_QUERY}>
                { ({data: {orders}, loading, error}) => {
                    console.log(orders);
                    if(loading) return <p>loading...</p>;
                    if(error) return <Error error={error}/>;
                    return (
                        <OrderUl>
                            {orders.map( order => (
                                <OrderItemStyles>
                                    <Link href={{
                                        pathname:"/order",
                                        query:{id: order.id}
                                    }}>
                                        <a>
                                            <div className="order-meta">
                                                <p>{order.items.reduce( (a,b) => a+b.quantity, 0) } Items</p>
                                                <p>{formatDate(order.createdAt)}</p>
                                                {/* <p>{formatDistance(order.createdAt, new Date())}</p> */}
                                                <p>Total: {formatMoney(order.total)}</p>
                                            </div>
                                            <div className="images">
                                                {order.items.map(item => (
                                                    <img key={item.id} src={item.image} alt={item.title} />
                                                ))}
                                            </div>
                                        </a>
                                    </Link>
                                </OrderItemStyles>
                            ))}
                        </OrderUl>
                    )
                }}
            </Query>
        );
    }
}

export default OrderList;