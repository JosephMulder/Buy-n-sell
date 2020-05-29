import React, { Component } from 'react';
import AccountStyles from './styles/AccountStyles';
import { CURRENT_USER_QUERY} from './User';
import { Query } from 'react-apollo';

class Account extends Component {
    render() {
        return (
            <Query query={CURRENT_USER_QUERY}>
              { ( {data, loading}) => {
                  console.log("account info", data);
                    if(loading) return <p>Loading...</p>;
                    return (
                    <AccountStyles>
                        <h2>Account Info:</h2>
                        <p>
                            <span>Email:</span> 
                            <span>{data.me.email}</span>
                        </p>
                        <p>
                            <span>Name:</span>
                            <span>{data.me.name}</span>
                        </p>
                        <p>
                            <span>Permissions:</span> 
                            <span>{data.me.permissions.map((permission, index)=> {
                                if(index===0) {
                                    return permission;
                                } else {
                                    return `, ${permission}`;
                                }
                            })}</span>
                        </p>
                        <p>
                            <span>ID:</span>
                            <span>{data.me.id}</span>
                        </p>
                    </AccountStyles>
                    );
              }}
            </Query>
        );
    }
}

export default Account;