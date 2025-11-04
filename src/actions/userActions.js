// src/actions/userActions.js
import api, { auth } from "../api";
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,

  CARD_CREATE_RESET,

  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,

  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,

  UPDATE_USER_DETAILS_REQUEST,
  UPDATE_USER_DETAILS_SUCCESS,
  UPDATE_USER_DETAILS_FAIL,

  DELETE_USER_ACCOUNT_REQUEST,
  DELETE_USER_ACCOUNT_SUCCESS,
  DELETE_USER_ACCOUNT_FAIL,

  GET_USER_ALL_ADDRESSES_REQUEST,
  GET_USER_ALL_ADDRESSES_SUCCESS,
  GET_USER_ALL_ADDRESSES_FAIL,

  GET_SINGLE_ADDRESS_REQUEST,
  GET_SINGLE_ADDRESS_SUCCESS,
  GET_SINGLE_ADDRESS_FAIL,

  CREATE_USER_ADDRESS_REQUEST,
  CREATE_USER_ADDRESS_SUCCESS,
  CREATE_USER_ADDRESS_FAIL,

  UPDATE_USER_ADDRESS_REQUEST,
  UPDATE_USER_ADDRESS_SUCCESS,
  UPDATE_USER_ADDRESS_FAIL,

  DELETE_USER_ADDRESS_REQUEST,
  DELETE_USER_ADDRESS_SUCCESS,
  DELETE_USER_ADDRESS_FAIL,

  CHECK_TOKEN_VALID_REQUEST,
  CHECK_TOKEN_VALID_SUCCESS,
  CHECK_TOKEN_VALID_FAIL,

  GET_ALL_ORDERS_REQUEST,
  GET_ALL_ORDERS_SUCCESS,
  GET_ALL_ORDERS_FAIL,

  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_REQUEST,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
} from "../constants/index";

/* ---------------------------------------
   Helpers
----------------------------------------*/
const normalizeUser = (data) => {
  const token = data?.access || data?.token || "";
  const refresh = data?.refresh || "";
  const admin = !!(data?.admin ?? data?.is_staff ?? data?.isAdmin);
  const user = { ...data, token, access: token, refresh, admin };
  return user;
};

const authHeader = (getState) => {
  const { userLoginReducer: { userInfo } = {} } = getState();
  const token = userInfo?.token || userInfo?.access;
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

/* ---------------------------------------
   AUTH
----------------------------------------*/

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    // SimpleJWT default endpoint
    const pair = await auth.tokenPair({ username: email, password });

    // Optional: try to fetch profile; ignore if not present
    let profile = {};
    try {
      const { data } = await api.get("/api/users/profile/");
      profile = data || {};
    } catch {}

    const user = normalizeUser({ ...pair, ...profile, email });
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });
    localStorage.setItem("userInfo", JSON.stringify(user));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error.message,
    });
  }
};

export const googleLogin = (idToken) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const { data } = await api.post(
      "/api/google-login/",
      { id_token: idToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const user = normalizeUser(data);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });
    localStorage.setItem("userInfo", JSON.stringify(user));
    if (user.access) localStorage.setItem("access", user.access);
    if (user.refresh) localStorage.setItem("refresh", user.refresh);
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error.message,
    });
  }
};

export const logout = () => (dispatch) => {
  auth.logout();
  localStorage.removeItem("userInfo");
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: CARD_CREATE_RESET });
};

/* ---------------------------------------
   Registration
----------------------------------------*/

export const register = (username, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const { data } = await api.post(
      "/api/account/register/",
      { username, email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.details ||
        error.message,
    });
  }
};

/* ---------------------------------------
   Token check (ADMIN pages use it)
----------------------------------------*/
export const checkTokenValidation = () => async (dispatch) => {
  try {
    dispatch({ type: CHECK_TOKEN_VALID_REQUEST });
    // any protected endpoint will do; we added this one in payments app
    await api.get("/payments/check-token/");
    dispatch({ type: CHECK_TOKEN_VALID_SUCCESS });
  } catch (error) {
    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.details ||
      error.message;
    dispatch({ type: CHECK_TOKEN_VALID_FAIL, payload: msg });
  }
};

/* ---------------------------------------
   USER
----------------------------------------*/

export const userDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    const { data } = await api.get(`/api/account/user/${id}/`, authHeader(getState));
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

export const userUpdateDetails = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_USER_DETAILS_REQUEST });
    const {
      userLoginReducer: { userInfo },
    } = getState();
    const { data } = await api.put(
      `/api/account/user_update/${userInfo.id}/`,
      {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      },
      authHeader(getState)
    );
    dispatch({ type: UPDATE_USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_DETAILS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

export const userAccountDelete = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ACCOUNT_REQUEST });
    const { data } = await api.post(
      `/api/account/user_delete/${userData.id}/`,
      { password: userData.password },
      authHeader(getState)
    );
    dispatch({ type: DELETE_USER_ACCOUNT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_USER_ACCOUNT_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

/* ---------------------------------------
   Addresses
----------------------------------------*/

export const getAllAddress = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_USER_ALL_ADDRESSES_REQUEST });
    const { data } = await api.get(
      "/api/account/all-address-details/",
      authHeader(getState)
    );
    dispatch({ type: GET_USER_ALL_ADDRESSES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ALL_ADDRESSES_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

export const getSingleAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_SINGLE_ADDRESS_REQUEST });
    const { data } = await api.get(
      `/api/account/address-details/${id}/`,
      authHeader(getState)
    );
    dispatch({ type: GET_SINGLE_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_SINGLE_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

export const createUserAddress =
  (addressData) => async (dispatch, getState) => {
    try {
      dispatch({ type: CREATE_USER_ADDRESS_REQUEST });
      const { data } = await api.post(
        "/api/account/create-address/",
        addressData,
        authHeader(getState)
      );
      dispatch({ type: CREATE_USER_ADDRESS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: CREATE_USER_ADDRESS_FAIL,
        payload:
          error?.response?.data?.details ||
          error?.response?.data?.detail ||
          error.message,
      });
    }
  };

export const updateUserAddress =
  (id, addressData) => async (dispatch, getState) => {
    try {
      dispatch({ type: UPDATE_USER_ADDRESS_REQUEST });
      const { data } = await api.put(
        `/api/account/update-address/${id}/`,
        addressData,
        authHeader(getState)
      );
      dispatch({ type: UPDATE_USER_ADDRESS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: UPDATE_USER_ADDRESS_FAIL,
        payload:
          error?.response?.data?.details ||
          error?.response?.data?.detail ||
          error.message,
      });
    }
  };

export const deleteUserAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ADDRESS_REQUEST });
    const { data } = await api.delete(
      `/api/account/delete-address/${id}/`,
      authHeader(getState)
    );
    dispatch({ type: DELETE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_USER_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};

/* ---------------------------------------
   Orders
----------------------------------------*/

export const getAllOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ALL_ORDERS_REQUEST });
    const { data } = await api.get(
      "/api/account/all-orders-list/",
      authHeader(getState)
    );
  dispatch({ type: GET_ALL_ORDERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_ORDERS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error.message,
    });
  }
};
