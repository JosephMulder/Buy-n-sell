import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  };
  handleChange = e => {
    const { name, type, value } = e.target;
    let val = "";
    if(value !== "") {
      val = type === 'number' ? parseFloat(value) : value;
    } else {
      val = value;
    }
    this.setState({ [name]: val });
  };

  uploadFile = async e => {
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    const res = await fetch('https://api.cloudinary.com/v1_1/wesbostutorial/image/upload', {
      method: 'POST',
      body: data,
    });
    const file = await res.json();
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    });
  };
  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => {
          //if (loading) return <p>Loading</p>;
          if (error) return <Error error={error}/>
          return (
          <Form
            data-test="form"
            onSubmit={async e => {
              // Stop the form from submitting
              e.preventDefault();
              // call the mutation
              const res = await createItem();
              // change them to the single item page
              // console.log(res);
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id },
              });
            }}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img width="200" src={this.state.image} alt="Upload Preview" />
                )}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
          )
        }}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };

// import React, { Component } from 'react';
// import { Mutation } from 'react-apollo';
// import gql from 'graphql-tag';
// import Form from './styles/Form';
// import formatMoney from '../lib/formatMoney';
// import Error from './ErrorMessage';
// import Router from 'next/router';
// import { formatDistance } from 'date-fns';
// import ALL_ITEMS_QUERY from './Items';

// const CREATE_ITEM_MUTATION = gql`
//     mutation CREATE_ITEM_MUTATION(
//         $title: String!
//         $description: String!
//         $price: Int!
//         $image: String
//         $largeImage: String
//     ) {
//         createItem(
//             title: $title
//             description: $description
//             price: $price
//             image: $image
//             largeImage: $largeImage
//         ) {
//            id 
//         }
//     }
// `;

// let ALL_ITEMS_QUERY2 = gql`
//     query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = 4) {
//         items(first: $first, skip: $skip, orderBy: id_DESC) {
//             id
//             title
//             price
//             description
//             image 
//             largeImage
//         }
//     }
// `;

// class CreateItem extends Component {
//     state = {
//         title: '',
//         description: '',
//         image: '',
//         largeImage: '',
//         price: 0
//     }
//     handleChange = (e) => {
//         const { name, type, value } = e.target;
//         const val = type === 'number' ? parseFloat(value) : value;

//         this.setState({
//             [name]: value
//         });
//     };
//     uploadFile = async e => {
//         const files = e.target.files;
//         const data = new FormData();
//         data.append('file', files[0]);
//         data.append('upload_preset', 'sickfits');
//         const res = await fetch('https://api.cloudinary.com/v1_1/dy9brfgoo/image/upload/',  {
//             method: 'POST',
//             body: data
//         });
//         // console.log('uploading file..');
//         const file = await res.json();
//         console.log(file);
//         this.setState({
//             image: file.secure_url,
//             largeImage: file.eager[0].secure_url
//         });
//     }
//     render() {
//         return (
//         <Mutation refetchQueries={[{query: ALL_ITEMS_QUERY2}]} mutation={CREATE_ITEM_MUTATION} variables={this.state}>
//         {(createItem, { loading, error, called, data}) => (
                    
//             <Form
//                 data-test="form"
//                 onSubmit={async e => {
//                 // Stop the form from submitting
//                 e.preventDefault();
//                 // Call the mutation
//                 const res = await createItem();
//                 // Chang ethem to the single item page
//                 Router.push({
//                     pathname: '/item',
//                     query: {id: res.data.createItem.id}
//                 });
//                 console.log(res);
                
//             }}>
//                 <Error error={error}/>
//                 <fieldset disabled={loading} aria-busy={loading}> 

//                     <label htmlFor="file">
//                         Title
//                         <input 
//                             type="file" 
//                             id="file"
//                             name="file" 
//                             placeholder="Upload an image"
//                             onChange={this.uploadFile}
//                             required/>
//                             {this.state.image && <img src={this.state.image} width="200" alt="image preview"/>}
//                     </label>

//                     <label htmlFor="title">
//                         Title
//                         <input 
//                             type="text" 
//                             id="title"
//                             name="title" 
//                             placeholder="Title"
//                             onChange={this.handleChange}
//                             value={this.state.title} 
//                             required/>
//                     </label>

//                     <label htmlFor="price">
//                         Price
//                         <input 
//                             type="number" 
//                             id="price"
//                             name="price" 
//                             placeholder="Price"
//                             onChange={this.handleChange}
//                             value={this.state.price} 
//                             required/>
//                     </label>

//                     <label htmlFor="description">
//                         Description
//                         <textarea 
//                             id="description"
//                             name="description" 
//                             placeholder="Enter a description"
//                             onChange={this.handleChange}
//                             value={this.state.description} 
//                             required/>
//                     </label>
//                     <button tpye="submit" >Submit</button>
//                 </fieldset>
//                 <h2>Sell an item</h2>
//             </Form>
//             )}
//         </Mutation>

//         );
//     }
// }

// export default CreateItem;
// export {CREATE_ITEM_MUTATION};