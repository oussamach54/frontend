// src/actions/userActions.js
import api from "../api";
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
} from "../constants";

// ----------------------------
// helpers
// ----------------------------
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

const normalizeUser = (raw) => {
  const token   = raw?.access || raw?.token || "";
  const refresh = raw?.refresh || "";
  const admin   = !!(raw?.admin ?? raw?.is_staff ?? raw?.isAdmin);
  const username = raw?.username || raw?.user?.username || "";
  const email = raw?.email || raw?.user?.email || "";
  const id = raw?.id || raw?.user?.id;
  return { ...raw, id, username, email, admin, access: token, token, refresh };
};

const authHeader = (getState) => {
  const token = getState()?.userLoginReducer?.userInfo?.access
             || getState()?.userLoginReducer?.userInfo?.token;
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const remember = (user) => {
  if (user?.access) localStorage.setItem(ACCESS_KEY, user.access);
  if (user?.refresh) localStorage.setItem(REFRESH_KEY, user.refresh);
  localStorage.setItem("userInfo", JSON.stringify(user));
};

// ----------------------------
// AUTH
// ----------------------------
export const login = (email, password) => async (dispatch) => {
  dispatch({ type: USER_LOGIN_REQUEST });

  // we try /account/login/ first (your app),
  // then standard /api/token/ (SimpleJWT)
  const attempts = [
    { url: "/account/login/", body: { username: email, password } },
    { url: "/api/token/",     body: { username: email, password } },
  ];

  try {
    let data = null, lastErr = null;

    for (const a of attempts) {
      try {
        const res = await api.post(a.url, a.body, {
          headers: { "Content-Type": "application/json" },
        });
        data = res.data;
        break;
      } catch (e) {
        lastErr = e;
        // if 404 or 405, continue; other errors bubble
        const code = e?.response?.status;
        if (code && code !== 404 && code !== 405) throw e;
      }
    }

    if (!data) throw lastErr || new Error("Login failed");

    const user = normalizeUser(data);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });
    remember(user);
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed",
    });
  }
};

export const googleLogin = (googleAccessToken) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const { data } = await api.post(
      "/account/google-login/",
      { id_token: googleAccessToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const user = normalizeUser(data);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });
    remember(user);
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message,
    });
  }
};

export const logout = () => (dispatch) => {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("userInfo");
  } catch {}
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: CARD_CREATE_RESET });
};

// ----------------------------
// Register
// ----------------------------
export const register = (username, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const { data } = await api.post(
      "/account/register/",
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
        error?.message,
    });
  }
};

// ----------------------------
// Token/health check (admin pages)
// ----------------------------
export const checkTokenValidation = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CHECK_TOKEN_VALID_REQUEST });
    // in this rollback tree, payments is mounted at /payments/
    await api.get("/payments/health/", authHeader(getState));
    dispatch({ type: CHECK_TOKEN_VALID_SUCCESS });
  } catch (error) {
    dispatch({
      type: CHECK_TOKEN_VALID_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.details ||
        error?.message ||
        "Unauthorized",
    });
  }
};

// ----------------------------
// USER
// ----------------------------
export const userDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    const { data } = await api.get(`/account/users/${id}/`, authHeader(getState));
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const userUpdateDetails = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_USER_DETAILS_REQUEST });
    const me = getState()?.userLoginReducer?.userInfo;
    const { data } = await api.put(
      `/account/users/${me?.id}/update/`,
      { username: userData.username, email: userData.email, password: userData.password },
      authHeader(getState)
    );
    dispatch({ type: UPDATE_USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_DETAILS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const userAccountDelete = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ACCOUNT_REQUEST });
    const { data } = await api.post(
      `/account/users/${userData.id}/delete/`,
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
        error?.message,
    });
  }
};

// ----------------------------
// Addresses
// ----------------------------
export const getAllAddress = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_USER_ALL_ADDRESSES_REQUEST });
    const { data } = await api.get("/account/addresses/", authHeader(getState));
    dispatch({ type: GET_USER_ALL_ADDRESSES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ALL_ADDRESSES_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const getSingleAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_SINGLE_ADDRESS_REQUEST });
    const { data } = await api.get(`/account/addresses/${id}/`, authHeader(getState));
    dispatch({ type: GET_SINGLE_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_SINGLE_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const createUserAddress = (payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_USER_ADDRESS_REQUEST });
    const { data } = await api.post(
      "/account/addresses/create/",
      payload,
      authHeader(getState)
    );
    dispatch({ type: CREATE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_USER_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const updateUserAddress = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_USER_ADDRESS_REQUEST });
    const { data } = await api.put(
      `/account/addresses/${id}/update/`,
      payload,
      authHeader(getState)
    );
    dispatch({ type: UPDATE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

export const deleteUserAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ADDRESS_REQUEST });
    const { data } = await api.delete(
      `/account/addresses/${id}/delete/`,
      authHeader(getState)
    );
    dispatch({ type: DELETE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_USER_ADDRESS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

// ----------------------------
// Orders
// ----------------------------
export const getAllOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ALL_ORDERS_REQUEST });
    const { data } = await api.get("/account/orders/", authHeader(getState));
    dispatch({ type: GET_ALL_ORDERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_ORDERS_FAIL,
      payload:
        error?.response?.data?.details ||
        error?.response?.data?.detail ||
        error?.message,
    });
  }
};

// ----------------------------
// Password reset
// ----------------------------
export const requestPasswordReset = (email) => async (dispatch) => {
  try {
    dispatch({ type: PASSWORD_RESET_REQUEST });
    await api.post(
      "/account/password-reset/",
      { email },
      { headers: { "Content-Type": "application/json" } }
    );
    dispatch({ type: PASSWORD_RESET_SUCCESS });
  } catch (error) {
    dispatch({
      type: PASSWORD_RESET_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.details ||
        error?.message,
    });
  }
};

export const confirmPasswordReset = ({ uid, token, new_password }) => async (dispatch) => {
  try {
    dispatch({ type: PASSWORD_RESET_CONFIRM_REQUEST });
    await api.post(
      "/account/password-reset/confirm/",
      { uid, token, new_password },
      { headers: { "Content-Type": "application/json" } }
    );
    dispatch({ type: PASSWORD_RESET_CONFIRM_SUCCESS });
  } catch (error) {
    dispatch({
      type: PASSWORD_RESET_CONFIRM_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.data?.details ||
        error?.message,
    });
  }
};
