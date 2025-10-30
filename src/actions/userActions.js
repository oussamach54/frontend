// src/actions/userActions.js
import axios from 'axios';
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

  // ✅ Add these to your constants/index.js
  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_REQUEST,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
} from '../constants/index';

/* ---------------------------------------
   Helpers
----------------------------------------*/
const normalizeUser = (data) => {
  const token = data?.access || data?.token || '';
  const admin = !!(data?.admin ?? data?.is_staff ?? data?.isAdmin);
  const user = { ...data, token, admin };
  return user;
};

const authHeader = (getState) => {
  const { userLoginReducer: { userInfo } = {} } = getState();
  const token = userInfo?.token || userInfo?.access;
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

/* ---------------------------------------
   AUTH
----------------------------------------*/

/**
 * Email/password login (backward-compatible):
 * - Sends { email, username: email, password } so it works whether
 *   your backend expects "email" or "username".
 */
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    // 🔗 Adjust if your endpoint differs
    const { data } = await axios.post(
      '/account/login/',
      { email, username: email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = normalizeUser(data);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });

    if (user.token) axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    localStorage.setItem('userInfo', JSON.stringify(user));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        (error.response && (error.response.data.detail || error.response.data.details)) ||
        error.message,
    });
  }
};

// Google login (unchanged)
export const googleLogin = (idToken) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    // 🔗 Adjust if your endpoint differs
    const { data } = await axios.post(
      '/account/google-login/',
      { id_token: idToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = normalizeUser(data);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });

    if (user.token) axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    localStorage.setItem('userInfo', JSON.stringify(user));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        (error.response && (error.response.data.detail || error.response.data.error)) ||
        error.message,
    });
  }
};

// Logout
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  delete axios.defaults.headers.common['Authorization'];
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: CARD_CREATE_RESET });
};

/* ---------------------------------------
   Registration
----------------------------------------*/

// Register (no auto-login)
export const register = (username, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    // 🔗 Adjust if your endpoint differs
    const { data } = await axios.post(
      '/account/register/',
      { username, email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        (error.response && (error.response.data.detail || error.response.data.details)) ||
        error.message,
    });
  }
};

// Validate token (unchanged)
export const checkTokenValidation = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CHECK_TOKEN_VALID_REQUEST });
    const { data } = await axios.get('/payments/check-token/', authHeader(getState));
    dispatch({ type: CHECK_TOKEN_VALID_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHECK_TOKEN_VALID_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

/* ---------------------------------------
   Password reset (Forgot password)
----------------------------------------*/

/**
 * Step 1: user submits email; backend sends reset email.
 * Expected body: { email }
 * Typical endpoints:
 *   - Your custom: /account/password-reset/
 *   - Djoser: /auth/users/reset_password/
 */
export const requestPasswordReset = (email) => async (dispatch) => {
  try {
    dispatch({ type: PASSWORD_RESET_REQUEST });

    // 🔗 Adjust if your endpoint differs
    await axios.post(
      '/account/password-reset/',
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    );

    dispatch({ type: PASSWORD_RESET_SUCCESS });
  } catch (error) {
    dispatch({
      type: PASSWORD_RESET_FAIL,
      payload:
        (error.response && (error.response.data.detail || error.response.data.details)) ||
        error.message,
    });
  }
};

/**
 * Step 2: user clicks email link → you receive uid/token (or code)
 * Expected body (common patterns):
 *   - { uid, token, new_password }
 *   - Djoser expects { uid, token, new_password }
 *   - Django-allauth may use key names slightly different; adjust as needed.
 */
export const confirmPasswordReset = ({ uid, token, new_password }) => async (dispatch) => {
  try {
    dispatch({ type: PASSWORD_RESET_CONFIRM_REQUEST });

    // 🔗 Adjust if your endpoint differs
    await axios.post(
      '/account/password-reset/confirm/',
      { uid, token, new_password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    dispatch({ type: PASSWORD_RESET_CONFIRM_SUCCESS });
  } catch (error) {
    dispatch({
      type: PASSWORD_RESET_CONFIRM_FAIL,
      payload:
        (error.response && (error.response.data.detail || error.response.data.details)) ||
        error.message,
    });
  }
};

/* ---------------------------------------
   USER
----------------------------------------*/

export const userDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    const { data } = await axios.get(`/account/user/${id}`, authHeader(getState));
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
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

    const { data } = await axios.put(
      `/account/user_update/${userInfo.id}/`,
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
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

export const userAccountDelete = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ACCOUNT_REQUEST });

    const { data } = await axios.post(
      `/account/user_delete/${userData.id}/`,
      { password: userData.password },
      authHeader(getState)
    );

    dispatch({ type: DELETE_USER_ACCOUNT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_USER_ACCOUNT_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

/* ---------------------------------------
   ADDRESSES
----------------------------------------*/

export const getAllAddress = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_USER_ALL_ADDRESSES_REQUEST });
    const { data } = await axios.get('/account/all-address-details/', authHeader(getState));
    dispatch({ type: GET_USER_ALL_ADDRESSES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ALL_ADDRESSES_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

export const getSingleAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_SINGLE_ADDRESS_REQUEST });
    const { data } = await axios.get(`/account/address-details/${id}/`, authHeader(getState));
    dispatch({ type: GET_SINGLE_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_SINGLE_ADDRESS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

export const createUserAddress = (addressData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_USER_ADDRESS_REQUEST });
    const { data } = await axios.post('/account/create-address/', addressData, authHeader(getState));
    dispatch({ type: CREATE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_USER_ADDRESS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

export const updateUserAddress = (id, addressData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_USER_ADDRESS_REQUEST });
    const { data } = await axios.put(`/account/update-address/${id}/`, addressData, authHeader(getState));
    dispatch({ type: UPDATE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_ADDRESS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

export const deleteUserAddress = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_USER_ADDRESS_REQUEST });
    const { data } = await axios.delete(`/account/delete-address/${id}/`, authHeader(getState));
    dispatch({ type: DELETE_USER_ADDRESS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_USER_ADDRESS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};

/* ---------------------------------------
   ORDERS
----------------------------------------*/

export const getAllOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_ALL_ORDERS_REQUEST });
    const { data } = await axios.get('/account/all-orders-list/', authHeader(getState));
    dispatch({ type: GET_ALL_ORDERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_ORDERS_FAIL,
      payload:
        (error.response && (error.response.data.details || error.response.data.detail)) ||
        error.message,
    });
  }
};
