import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION($email: String!, $password: String!) {
        signin(email: $email, password: $password) {
            id 
            email
            name
        }
    }
`;
class Signin extends Component {
    state = {
        name: "demo",
        password: "123",
        email: "demo@gmail.com"
    }
    saveToState = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };
    render() {
        return (
            <Mutation 
                mutation={SIGNIN_MUTATION} 
                variables={this.state}
                refetchQueries={[{query: CURRENT_USER_QUERY}]} 
                >
                { (signin, {error, loading}) => (

            <Form method="post" onSubmit={ async (e) => {
               e.preventDefault();
               const res = await signin();
               console.log(res);
               this.setState({
                   name: 'Demo',
                   email: 'demo@gmail.com',
                   password: '123'
               });
            }}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Sign into demo account</h2>
                    <Error error={error}/>
                    <label htmlFor="email">
                        Email
                        <input
                            disabled="true"
                            type="email" 
                            name="email" 
                            placeholder="email" 
                            value={this.state.email}
                        />
                    </label>  

                    <label htmlFor="password">
                        Password
                        <input
                            disabled="true"
                            type="password" 
                            name="password" 
                            placeholder="password" 
                            value={this.state.password}
                        />
                    </label>  
                    <button type="submit">Sign into Demo Account!</button>
                </fieldset>
            </Form>
        )}
    </Mutation>
        );
    }
}

export default Signin;