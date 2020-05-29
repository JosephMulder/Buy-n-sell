
// This is where it would connect to db and insert it
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../Mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
    async createItem(parent, args, ctx, info) {
        // TODO: Check if they are logged in
        if(!ctx.request.userId) {
          throw new Error("You must be logged in to do that.");
        }
        const item = await ctx.db.mutation.createItem(
          {
            data: { // This is how you create a relationship betweem item and user
              user: {
                connect: {
                  id: ctx.request.userId
                }
              },
              ...args,
            },
          },
          info
        );
    
        console.log(item);
    
        return item;
      },
      updateItem(parent, args, ctx, info) {
        // first take a copy of the updates
        const updates = { ...args };
        // remove the ID from the updates
        delete updates.id;
        // run the update method
        return ctx.db.mutation.updateItem({
          data: updates,
          where: {
            id: args.id,
          },

        }, 
        info
        );
      },
      async deleteItem(parent, args, ctx, info) {
        const where = {id: args.id};
        // find the item
        const item = await ctx.db.query.item({ where}, `{ id title user { id }}`);
        // check if they own that item, or have the permissions
          const ownsItem = item.user.id === ctx.request.userId;
          const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
          if(!ownsItem && !hasPermissions) {
            throw new Error("You dont have permission to do that!");
          }
        //delete it
        return ctx.db.mutation.deleteItem({ where}, info);
      },
      async signup(parent, args, ctx, info) {
        // lowercase their password
        args.email = args.email.toLowerCase();
        //hash their password
        const password = await bcrypt.hash(args.password, 10);
        // create the user in the database
        const user = await ctx.db.mutation.createUser({
          data: {
            name: args.name,
            email: args.email,
            password: password,
            permissions: { set: ['USER']}
          },
        },
        info
        );
        // create jwt token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // we set the jwt as a cookie on  the response 
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        });
        // We return user to the browser
        return user;
      },
      async signin(parent, {email, password}, ctx, info) {
        // 1. check if there is a user with that email
        const user = await ctx.db.query.user({ where: {email: email}});
        if (!user ) {
          throw new Error(`No such user found for email ${email}`);

        }
        // 2. check if their pass is correct
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
          throw new Error("Invalid Password!");
        }
        // 3. generate the jwt token
        const token = jwt.sign({ userId: user.id}, process.env.APP_SECRET);
        // 4. set the cookie with the token
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // 5. return the user
        return user;
      },
      signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');
        return { message: 'Logged out'};
      },
      async requestReset(parent, args, ctx, info) {
        // 1. check if this is a real user
        const user = await ctx.db.query.user({ where: { email: args.email }});
        if (!user) {
          throw new Error(`No such user found for email $ ${args.email}`)
        }
        // 2. Set a reset token and expiry on that user
        const randomBytesPromise = promisify(randomBytes);
        const resetToken = (await randomBytesPromise(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;//1 hour from current time
        const res = ctx.db.mutation.updateUser({
          where: { email: args.email},
          data: {resetToken, resetTokenExpiry}
        });
        console.log(res, 'requestReset response');
        // 3. Email them that reset token
        const mailRes = await transport.sendMail({
          from: 'josephmulder800@gmail.com',
          to: user.email,
          subject: "Your password Reset Token",
          html: makeANiceEmail(`Your password reset Token is here!
           \n \n
          <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`)
        });
        // 4. return message
        return {message: resetTokenExpiry};
      },
      async resetPassword(parent, args, ctx, info) {
        // 1. check if the passwords match
        if (args.password !== args.confirmPassword) {
          throw new Error("passwords dont match");
        }
        // 2. check if its a legit reset token
        // 3. check if its expired
        const [user] = await ctx.db.query.users({
          where: {
            resetToken: args.resetToken,
            resetTokenExpiry_gte: Date.now(),
          },
        });
        if (!user) {
          console.log(user);
          throw new Error('This token is either invalid or expired');
        }
        // 4. hash their new password
        const password = await bcrypt.hash(args.password, 10);
        // 5, save the new pasword to the user and remove the old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
          where: {email: user.email},
          data: {
            password,
            resetToken: null,
            resetTokenExpiry: null
          },
        });
        // 6. generate jwt
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        // 7. set the jwt cookie
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // 8. return the new user
        return updatedUser;
      },
     async updatePermissions(parent, args, ctx, info) {
       // 1. check if they are logged in
       if (!ctx.request.userId) {
         throw new Error('You must be logged in!');
       }
       // 2. query the current user
       const currentUser = await ctx.db.query.user(
         {
           where: {
             id: ctx.request.userId,
           },
         },
         info
       );
       // 3. checkif they have permissions to do this
       hasPermission(currentUser, ['ADMIN', 'PERMISSION']);// throws error if they dont have the permission
       // 4. update the permissions
       return ctx.db.mutation.updateUser({
         data: {
           permissions: {
             set: args.permissions,
           },
         },
         where: {
          id: args.userId
         },
       },
        info
      );
     }, 
     async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in soooon');
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is already in their cart');
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id,
      },
    }, `{ id, user {id}}`);
    // 1.5 Make sure we found an item
    if(!cartItem) throw new Error('No CartItem found!');
    // 2. Make sure they own that cart item
    if(cartItem.user.id !== ctx.request.userId) {
      throw new Error("ID doesnt match");
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info);
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be signed in to complete this order.');
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
    );
    // 2. recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log(`Going to charge for a total of ${amount} the user info`);
    console.log(user);
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    console.log("WE MADE IT 4");
    // 4. Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    console.log("WE MADE IT 5");
    let d = new Date();
    const dateString = d.toISOString();

    // 5. create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
        createdAt: dateString,
        updatedAt: dateString
      },
    });
    console.log("WE MADE IT 6");

    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });
    console.log("WE MADE IT 7");

    // 7. Return the Order to the client
    return order;
  },
};

module.exports = Mutations;
