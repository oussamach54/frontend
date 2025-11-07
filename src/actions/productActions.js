// src/actions/productActions.js
import {
  PRODUCTS_LIST_REQUEST, PRODUCTS_LIST_SUCCESS, PRODUCTS_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST, PRODUCT_DETAILS_SUCCESS, PRODUCT_DETAILS_FAIL,
  CREATE_PRODUCT_REQUEST, CREATE_PRODUCT_SUCCESS, CREATE_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST, DELETE_PRODUCT_SUCCESS, DELETE_PRODUCT_FAIL,
  UPDATE_PRODUCT_REQUEST, UPDATE_PRODUCT_SUCCESS, UPDATE_PRODUCT_FAIL,
  CHANGE_DELIVERY_STATUS_REQUEST, CHANGE_DELIVERY_STATUS_SUCCESS, CHANGE_DELIVERY_STATUS_FAIL,
} from '../constants';

import api from '../api';

// -------- PUBLIC: products list
export const getProductsList = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCTS_LIST_REQUEST });
    const { data } = await api.get('/products/'); // NO auth
    dispatch({ type: PRODUCTS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PRODUCTS_LIST_FAIL, payload: error.message });
  }
};

// -------- PUBLIC: product details
export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    const { data } = await api.get(`/product/${id}/`); // NO auth
    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PRODUCT_DETAILS_FAIL, payload: error.message });
  }
};

// -------- AUTH: create product
export const createProduct = (product) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });
    const { data } = await api.post('/product-create/', product, {
      _authRequired: true, // <-- ONLY here we send JWT
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
    dispatch({ type: CREATE_PRODUCT_FAIL, payload: detail });
  }
};

// -------- AUTH: delete product
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });
    const { data } = await api.delete(`/product-delete/${id}/`, {
      _authRequired: true,
    });
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
    dispatch({ type: DELETE_PRODUCT_FAIL, payload: detail });
  }
};

// -------- AUTH: update product
export const updateProduct = (id, product) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });
    const { data } = await api.put(`/product-update/${id}/`, product, {
      _authRequired: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
    dispatch({ type: UPDATE_PRODUCT_FAIL, payload: detail });
  }
};

// -------- AUTH: change delivery status
export const changeDeliveryStatus = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: CHANGE_DELIVERY_STATUS_REQUEST });
    const { data } = await api.put(`/account/change-order-status/${id}/`, payload, {
      _authRequired: true,
      headers: { 'Content-Type': 'application/json' },
    });
    dispatch({ type: CHANGE_DELIVERY_STATUS_SUCCESS, payload: data });
  } catch (error) {
    const detail = error.response?.data?.detail || error.message;
    dispatch({ type: CHANGE_DELIVERY_STATUS_FAIL, payload: detail });
  }
};
