// src/reducers/index.js
import { combineReducers } from "redux";

import {
  productsListReducer,
  productDetailsReducer,
  createProductReducer,
  updateProductReducer,
  deleteProductReducer,
  changeDeliveryStatusReducer,
} from "./productReducers";

import {
  createCardReducer,
  chargeCardReducer,
  savedCardsListReducer,
  deleteSavedCardReducer,
  updateStripeCardtReducer,
} from "./cardReducers";

import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userDetailsUpdateReducer,
  deleteUserAccountReducer,
  checkTokenValidationReducer,
  getSingleAddressReducer,
  getAllAddressesOfUserReducer,
  createUserAddressReducer,
  updateUserAddressReducer,
  deleteUserAddressReducer,
  getAllOrdersReducer,
} from "./userReducers";

import { wishlistReducer } from "./wishlistReducers"; // ✅ import at the top

const allReducers = combineReducers({
  // products
  productsListReducer,
  productDetailsReducer,
  createProductReducer,
  updateProductReducer,
  deleteProductReducer,

  // payments / cards
  createCardReducer,
  chargeCardReducer,
  savedCardsListReducer,
  updateStripeCardtReducer,
  deleteSavedCardReducer,

  // users / auth / addresses / orders
  userLoginReducer,
  userRegisterReducer,
  getSingleAddressReducer,
  getAllAddressesOfUserReducer,
  createUserAddressReducer,
  updateUserAddressReducer,
  deleteUserAddressReducer,
  getAllOrdersReducer,
  changeDeliveryStatusReducer,
  checkTokenValidationReducer,
  userDetailsReducer,
  userDetailsUpdateReducer,
  deleteUserAccountReducer,

  // wishlist slice (the state will be under state.wishlist)
  wishlist: wishlistReducer, // ✅ register the wishlist slice
});

export default allReducers;
