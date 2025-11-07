// src/actions/wishlistActions.js
import api from "../api";

export const WISHLIST_LIST_REQUEST  = "WISHLIST_LIST_REQUEST";
export const WISHLIST_LIST_SUCCESS  = "WISHLIST_LIST_SUCCESS";
export const WISHLIST_LIST_FAIL     = "WISHLIST_LIST_FAIL";

export const WISHLIST_TOGGLE_REQUEST = "WISHLIST_TOGGLE_REQUEST";
export const WISHLIST_TOGGLE_SUCCESS = "WISHLIST_TOGGLE_SUCCESS";
export const WISHLIST_TOGGLE_FAIL    = "WISHLIST_TOGGLE_FAIL";

/** If no token is present, bail with a friendly message (prevents 401 spam) */
function hasToken() {
  return (
    localStorage.getItem("access_prod") ||
    localStorage.getItem("access_local") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token")
  );
}

export const fetchWishlist = () => async (dispatch) => {
  try {
    dispatch({ type: WISHLIST_LIST_REQUEST });

    if (!hasToken()) {
      return dispatch({
        type: WISHLIST_LIST_FAIL,
        payload: "Veuillez vous connecter pour voir votre wishlist.",
      });
    }

    const { data } = await api.get("/wishlist/");
    dispatch({ type: WISHLIST_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({
      type: WISHLIST_LIST_FAIL,
      payload: err?.response?.data?.detail || err.message,
    });
  }
};

export const toggleWishlist = (productId) => async (dispatch) => {
  try {
    dispatch({ type: WISHLIST_TOGGLE_REQUEST, payload: productId });

    if (!hasToken()) {
      return dispatch({
        type: WISHLIST_TOGGLE_FAIL,
        payload: "Veuillez vous connecter pour gérer votre wishlist.",
      });
    }

    // Backend mounted at /api/... → baseURL already includes /api
    await api.post("/wishlist/toggle/", { product_id: productId });

    // refresh list after toggling
    const { data } = await api.get("/wishlist/");
    dispatch({ type: WISHLIST_LIST_SUCCESS, payload: data });
    dispatch({ type: WISHLIST_TOGGLE_SUCCESS, payload: productId });
  } catch (err) {
    dispatch({
      type: WISHLIST_TOGGLE_FAIL,
      payload: err?.response?.data?.detail || err.message,
    });
  }
};
