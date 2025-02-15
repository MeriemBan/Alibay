import React, { Component } from "react";
// import StripeCheckout from "react-stripe-checkout";
import { connect } from "react-redux";
import ItemDetails from "./itemDetails.jsx";
import "./cart.css";

class UnconnectedCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: this.props.cart,
      items: this.props.items,
      itemId: this.props.itemId,
      quantity: 0,
      loggedIn: this.props.loggedIn,
      email: this.props.email
    };
  }

  componentDidMount = () => {
    let updateCartItems = async () => {
      // get all cart items from the server
      let response = await fetch("/cart-items");
      let responseBody = await response.text();
      //   console.log("responseBody", responseBody);
      let parsed = JSON.parse(responseBody);
      // console.log("parsed", parsed);
      this.props.dispatch({ type: "set-cart", cart: parsed });
    };
    setInterval(updateCartItems, 500);
  };

  // componentDidMount = () => {
  //   this.reload();
  // };
  // componentDidUpdate = (prevProps, prevState) => {
  //   if (prevState.cart !== this.state.cart) {
  //     this.reload();
  //   }
  // };

  // reload = async () => {
  //   let response = await fetch("/cart-items");
  //   let responseBody = await response.text();
  //   let parsed = JSON.parse(responseBody);
  //   this.props.dispatch({ type: "set-cart", cart: parsed });
  // };

  // onToken = token => {
  //   fetch("/save-stripe-token", {
  //     method: "POST",
  //     body: JSON.stringify(token)
  //   }).then(response => {
  //     response.json().then(data => {
  //       // alert(`Thank you for your purchase! ${data.email}`);
  //       // add username/email below
  //       alert(`Thank you for your purchase ${this.props.email}! `);
  //     });
  //   });
  // };

  removeOneFromCart = async itemId => {
    this.setState(
      {
        ...this.state,
        itemId: itemId,
        quantity: (this.state.quantity -= 1)
      },
      async () => {
        console.log("this.state.itemId", itemId);
        console.log("this.props.itemId", this.props.itemId);

        let data = new FormData();
        data.append("itemId", itemId);
        data.append("quantity", -1);
        let response = await (await fetch("/update-quantity-cart", {
          method: "POST",
          body: data
        })).text();
        let body = JSON.parse(response);
      }
    );
  };

  addOneToCart = async itemId => {
    this.setState(
      {
        ...this.state,
        itemId: itemId,
        quantity: (this.state.quantity += 1)
      },
      async () => {
        let data = new FormData();
        data.append("itemId", itemId);

        data.append("quantity", +1);
        let response = await (await fetch("/update-quantity-cart", {
          method: "POST",
          body: data
        })).text();
        let body = JSON.parse(response);
      }
    );
  };
  removeFromCart = async itemId => {
    this.setState(
      {
        ...this.state,
        itemId: itemId
        // itemId: this.props.itemId
      },
      async () => {
        let data = new FormData();
        // data.append("itemId", this.state.itemId);
        data.append("itemId", itemId);
        let response = await (await fetch("/remove-from-cart", {
          method: "POST",
          body: data
        })).text();
        let body = JSON.parse(response);
      }
    );
  };

  clearCart = async () => {
    let response = await (await fetch("/checkout", {
      method: "POST"
    })).text();
    let body = JSON.parse(response);
  };

  handleCheckout = () => {
    this.props.history.push("/checkout");
    return;
  };

  render = () => {
    let subTotal = 0;
    return (
      <div className="MainFrame">
        <div className="NavBlock" />
        <div className="ShoppingBag">
          <div className="ShoppingBagText">Shopping Bag</div>
          {this.props.cart.map(cartItem => {
            let itemDetails = this.props.items.filter(item => {
              return item._id === cartItem.itemId;
            })[0];

            return (
              <div className="ItemFrame">
                <a className="ItemsPictureFrame">
                  <img
                    className="ItemPictureCart"
                    src={itemDetails.filePath}
                    height="300px"
                    width="300px"
                  />
                </a>
                <div className="ItemsDetailsDiv">
                  <span className="ItemsName">{itemDetails.name}</span>
                  <span className="ItemsDescription">
                    {itemDetails.description}
                  </span>
                  <span className="ItemsCost"> {itemDetails.cost + "$ "} </span>
                </div>
                <div className="ItemsAction">
                  <div className="SubTotalDiv">
                    <span className="SubTotalText">
                      Sub total:⠀
                      <span className="SubTotalNumber">
                        {cartItem.quantity * itemDetails.cost}$
                      </span>
                      <div style={{ display: "none" }}>
                        {(subTotal += cartItem.quantity * itemDetails.cost)}
                      </div>
                      {console.log("subTotal", subTotal)}
                    </span>
                  </div>
                  <div className="QuantityButtons">
                    <div className="ItemsQuantity">
                      quantity: {cartItem.quantity}
                    </div>

                    <button
                      className="RemoveOneItemButton"
                      id="buttonCart"
                      onClick={() => this.removeOneFromCart(cartItem.itemId)}
                    >
                      -
                    </button>
                    <button
                      className="AddOneItemButton"
                      id="buttonCart"
                      onClick={() => this.addOneToCart(cartItem.itemId)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="RemoveItemButton"
                    onClick={() => this.removeFromCart(cartItem.itemId)}
                  >
                    remove from cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="Checkout">
          <h1 className="CheckoutText">Checkout</h1>
          <h1 className="TotalText">
            Total:
            <span className="TotalNumber"> {subTotal}$</span>
          </h1>
          {/* <h1>
            <div className="StripeFrame">
              <button
                className="StripeButton"
                onClick={this.clearCart}
                style={{ border: "0px" }}
              >
                <StripeCheckout
                  // {<button className="btn btn-primary">checkout now!
                  // </button>}
                  ComponentClass="div"
                  token={this.onToken}
                  stripeKey="pk_test_O9HT5wBse32v6Ev3y8xDbYnQ00SpdfFqSl"
                >
                  <button className="StripeButtonText">
                    {" "}
                    Proceed to payment{" "}
                  </button>
                </StripeCheckout>
              </button>
              <button onClick={this.handleCheckout}>checkout</button>
            </div>
          </h1> */}
          <button onClick={this.handleCheckout}>shipping details & payment</button>
        </div>
      </div>
    );
  };
}

let mapStateToProps = state => {
  return {
    email: state.email,
    cart: state.cart,
    items: state.items,
    itemId: state.itemId,
    loggedIn: state.loggedIn
  };
};
let Cart = connect(mapStateToProps)(UnconnectedCart);
export default Cart;
