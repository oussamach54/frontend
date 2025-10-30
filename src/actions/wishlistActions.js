// src/actions/wishlistActions.js
import axios from "axios";

export const WISHLIST_LIST_REQUEST  = "WISHLIST_LIST_REQUEST";
export const WISHLIST_LIST_SUCCESS  = "WISHLIST_LIST_SUCCESS";
export const WISHLIST_LIST_FAIL     = "WISHLIST_LIST_FAIL";

export const WISHLIST_TOGGLE_REQUEST = "WISHLIST_TOGGLE_REQUEST";
export const WISHLIST_TOGGLE_SUCCESS = "WISHLIST_TOGGLE_SUCCESS";
export const WISHLIST_TOGGLE_FAIL    = "WISHLIST_TOGGLE_FAIL";

const authConfig = (getState) => {
  const { userLoginReducer: { userInfo } = {} } = getState();
  const token = userInfo?.token || userInfo?.access;
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

export const fetchWishlist = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_LIST_REQUEST });
    const { data } = await axios.get("/api/wishlist/", authConfig(getState));
    dispatch({ type: WISHLIST_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: WISHLIST_LIST_FAIL,
      payload: err.response?.data?.detail || err.message,
    });
  }
};

export const toggleWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_TOGGLE_REQUEST, payload: productId });
    await axios.post(
      "/api/wishlist/toggle/",
      { product_id: productId },
      authConfig(getState)
    );
    const { data } = await axios.get("/api/wishlist/", authConfig(getState));
    dispatch({ type: WISHLIST_LIST_SUCCESS, payload: data });
    dispatch({ type: WISHLIST_TOGGLE_SUCCESS, payload: productId });
  } catch (err) {
    dispatch({
      type: WISHLIST_TOGGLE_FAIL,
      payload: err.response?.data?.detail || err.message,
    });
  }
};
