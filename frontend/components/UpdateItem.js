import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import Router from 'next/router';
import { formatDistance } from 'date-fns';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY( $id: ID!) {
        item(where: {id: $id}) {
          id
          title
          description
          price  
        }
    }
`; 

const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $id: ID!
        $title: String
        $description: String
        $price: Int
    ) {
        updateItem(
            id: $id
            title: $title
            description: $description
            price: $price
        ) {
           id
           title
           description
           price
        }
    }
`;

class UpdateItem extends Component {
    state = {

    }
    handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({
            [name]: value
        });
    };
    updateItem = async (e, updateItemMutation) => {
        e.preventDefault();
        console.log("updating item!");
        console.log(this.state);
        const res = await updateItemMutation({
            variables: {
                id: this.props.id,
                ...this.state
            }
        });
        console.log("Updated!");
    }

    render() {
        return (
    <Query query={SINGLE_ITEM_QUERY} variables={{id: this.props.id}}>
        {({data, loading}) => {
            if(loading) return <p>Loading...</p>;
            if(!data.item) return <p>No Item Found for ID</p>;
            return (


        <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
        {(updateItem, { loading, error}) => (
                    
            <Form 
                onSubmit={e => this.updateItem(e, updateItem)}
            >
                <Error error={error}/>
                <fieldset disabled={loading} aria-busy={loading}> 

                    <label htmlFor="title">
                        Title
                        <input 
                            type="text" 
                            id="title"
                            name="title" 
                            placeholder="Title"
                            onChange={this.handleChange}
                            defaultValue={data.item.title} 
                            required/>
                    </label>

                    <label htmlFor="price">
                        Price
                        <input 
                            type="number" 
                            id="price"
                            name="price" 
                            placeholder="Price"
                            onChange={this.handleChange}
                            defaultValue={data.item.price} 
                            required/>
                    </label>

                    <label htmlFor="description">
                        Description
                        <textarea 
                            id="description"
                            name="description" 
                            placeholder="Enter a description"
                            onChange={this.handleChange}
                            defaultValue={data.item.description} 
                            required/>
                    </label>
        <button tpye="submit" >Sav{loading?'ing': 'e'}</button>
                </fieldset>
                <h2>Update an item</h2>
            </Form>
            )}
        </Mutation>

                     
);
}}
</Query>
        );
    }
}

export default UpdateItem;
export {UPDATE_ITEM_MUTATION};


{/* <Query 
    query={SINGLE_ITEM_QUERY} 
    variables={{
        id: this.props.id
    }}>
    {({datas, loading}) => {
        if (loading) return <p>Loading...</p>;
        return (
            )   
        }}
    </Query> */}