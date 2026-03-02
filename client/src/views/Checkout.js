import React from "react";
import { useFormik } from "formik";
import { CardElement } from "@stripe/react-stripe-js";
import { Link } from "react-router-dom";
import CheckBox from "../components/CheckBox";
import AddressForm from "../components/AddressForm";
import { RiShoppingCartLine } from "react-icons/ri";

const EmptyAddress = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

function validateAddress(address) {
  const errors = {};
  if (!address.street) errors.street = "Street is required";
  if (!address.city) errors.city = "City is required";
  if (!address.state) errors.state = "State is required";
  if (!address.zip) errors.zip = "ZIP code is required";
  if (!address.country) errors.country = "Country is required";
  return errors;
}

function validatePurchase(values) {
  const errors = {};
  const billingErrors = validateAddress(values.billing);
  if (Object.keys(billingErrors).length !== 0) {
    errors.billing = billingErrors;
  }
  if (values.createAccount) {
    if (!values.name) {
      errors.name = "Name is required";
    }
    if (!values.password || values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
  }
  if (values.altShippingAddress) {
    const shippingErrors = validateAddress(values.shipping);
    if (Object.keys(shippingErrors).length !== 0) {
      errors.shipping = shippingErrors;
    }
  }
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }
  return errors;
}

export default function Checkout({ items = [], total = 0, user }) {
  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
      createAccount: false,
      altShippingAddress: false,
      billing: EmptyAddress,
      shipping: EmptyAddress,
      notes: "",
      email: "",
    },
    validate: validatePurchase,
    onSubmit: (values) => {
      console.log("Form submitted:", values);
    },
  });

  return (
    <Page>
      {items.length === 0 ? (
        <EmptyCheckout>
          <div className="content">
            <RiShoppingCartLine size={80} />
            <h2>No items in Cart</h2>
            <Link to="/shop/all" className="button">
              back to shop
            </Link>
          </div>
        </EmptyCheckout>
      ) : (
        <Checkout>
          <Coupon />
          <div className="content">
            <form onSubmit={formik.handleSubmit}>
              <div className="addresses">
                <div className="address">
                  <h4 className="address__type">billing address</h4>
                  <AddressForm
                    values={formik.values.billing}
                    handleChange={formik.handleChange}
                    type="billing"
                    errors={formik.errors.billing}
                  />
                  <div className="input-wrapper">
                    <label>email address</label>
                    <input
                      type="text"
                      name={`email`}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.email && (
                      <p className="error">{formik.errors.email}</p>
                    )}
                  </div>
                </div>
                {!user && (
                  <div>
                    <CheckBox
                      name="createAccount"
                      checked={formik.values.createAccount}
                      renderLabel={() => (
                        <h4 className="address__type">create account</h4>
                      )}
                      onChange={formik.handleChange}
                    />
                    {formik.values.createAccount && (
                      <div className="input-group">
                        <div className="input-wrapper">
                          <label>name</label>
                          <input
                            type="text"
                            name={`name`}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                          />
                          {formik.errors.name && (
                            <p className="error">{formik.errors.name}</p>
                          )}
                        </div>
                        <div className="input-wrapper">
                          <label>password</label>
                          <input
                            type="password"
                            name={`password`}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                          />
                          {formik.errors.password && (
                            <p className="error">{formik.errors.password}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="address shipping">
                  <CheckBox
                    name="altShippingAddress"
                    checked={formik.values.altShippingAddress}
                    renderLabel={() => (
                      <h4 className="address__type">
                        use different shipping address
                      </h4>
                    )}
                    onChange={formik.handleChange}
                  />
                  {formik.values.altShippingAddress && (
                    <AddressForm
                      values={formik.values.shipping}
                      errors={formik.errors.shipping}
                      handleChange={formik.handleChange}
                      type="shipping"
                    />
                  )}
                  <div className="input-wrapper">
                    <label htmlFor="notes">order notes</label>
                    <textarea
                      className="notes"
                      name="notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      id="notes"
                    />
                  </div>
                </div>
              </div>
              <div className="input-wrapper">
                <label>card details</label>
                <div className="user-card">
                  <div className="card">
                    <CardElement
                      className="eee"
                      options={{
                        hidePostalCode: true,
                        style: {
                          base: {
                            color: "#000",
                            "::placeholder": {
                              color: "#888",
                              textTransform: "uppercase",
                              fontVariant: "small-caps",
                              fontSize: "0.85rem",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className={`button purchase ${
                  formik.isSubmitting ? "loading" : ""
                }`}
                disabled={formik.isSubmitting}
              >
                place order
              </button>
            </form>
            <div className="summary">
              <div className="items">
                {items.map((item, i) => (
                  <CartItem {...item} key={i} />
                ))}
              </div>
              <div className="total">
                <span className="emph">Total:</span>
                <span>
                  {CURRENCY}
                  {total}
                </span>
              </div>
              <div className="meta">
                <p className="emph">Free Shipping included</p>
                <p className="emph">Delivery within 20 working days</p>
              </div>
            </div>
          </div>
        </Checkout>
      )}
    </Page>
  );
}
