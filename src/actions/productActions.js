// src/actions/productActions.js
import {
  PRODUCTS_LIST_REQUEST,
  PRODUCTS_LIST_SUCCESS,
  PRODUCTS_LIST_FAIL,

  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,

  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAIL,

  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAIL,

  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAIL,

  CHANGE_DELIVERY_STATUS_REQUEST,
  CHANGE_DELIVERY_STATUS_SUCCESS,
  CHANGE_DELIVERY_STATUS_FAIL,
} from "../constants/index";

import api from "../api"; // << use the shared axios instance

// Small helper to build auth header safely
const authConfig = (getState, contentType) => {
  const {
    userLoginReducer: { userInfo },
  } = getState();

  const token =
    userInfo?.access || // SimpleJWT "access"
    userInfo?.token  || // older code
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  const headers = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
};

// ============ LIST ============
export const getProductsList = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCTS_LIST_REQUEST });

    // NOTE: no /api prefix here
    const { data } = await api.get("/products/", { params });

    dispatch({ type: PRODUCTS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCTS_LIST_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};

// ============ DETAILS ============
export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });

    const { data } = await api.get(`/product/${id}/`);

    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};

// ============ CREATE (admin) ============
export const createProduct = (productFormData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const cfg = authConfig(getState, "multipart/form-data");

    const { data } = await api.post("/product-create/", productFormData, cfg);

    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_PRODUCT_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};

// ============ DELETE (admin) ============
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const cfg = authConfig(getState, "application/json");

    await api.delete(`/product-delete/${id}/`, cfg);

    dispatch({ type: DELETE_PRODUCT_SUCCESS });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};

// ============ UPDATE (admin) ============
export const updateProduct = (id, productFormData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const cfg = authConfig(getState, "multipart/form-data");

    const { data } = await api.put(`/product-update/${id}/`, productFormData, cfg);

    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};

// ============ CHANGE DELIVERY STATUS (admin) ============
export const changeDeliveryStatus = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHANGE_DELIVERY_STATUS_REQUEST });

    const cfg = authConfig(getState, "application/json");

    // Django: account/urls.py → "orders/<int:pk>/status/"
    const { data } = await api.put(`/account/orders/${id}/status/`, payload, cfg);

    dispatch({ type: CHANGE_DELIVERY_STATUS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHANGE_DELIVERY_STATUS_FAIL,
      payload:
        error?.response?.data?.detail ||
        error?.response?.statusText ||
        error.message,
    });
  }
};
