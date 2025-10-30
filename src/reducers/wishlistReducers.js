// src/reducers/wishlistReducers.js
import {
  WISHLIST_LIST_REQUEST, WISHLIST_LIST_SUCCESS, WISHLIST_LIST_FAIL,
  WISHLIST_TOGGLE_REQUEST, WISHLIST_TOGGLE_SUCCESS, WISHLIST_TOGGLE_FAIL
} from '../actions/wishlistActions';

const initialState = {
  loading: false,
  items: [],   // array of product objects
  error: null,
};

export const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case WISHLIST_LIST_REQUEST:
    case WISHLIST_TOGGLE_REQUEST:
      return { ...state, loading: true, error: null };

    case WISHLIST_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload };

    case WISHLIST_TOGGLE_SUCCESS:
      // we immediately refresh list in the action above,
      // so just mark not loading here
      return { ...state, loading: false };

    case WISHLIST_LIST_FAIL:
    case WISHLIST_TOGGLE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
