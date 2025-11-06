// src/actions/productActions.js
import api from "../api";
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

/* Small helper to always pick the right token key */
const pickToken = (getState) => {
  const { userLoginReducer: { userInfo } = {} } = getState();
  return userInfo?.access || userInfo?.token || "";
};

/* ---------------------------------------
   LIST + DETAILS
----------------------------------------*/
export const getProductsList = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCTS_LIST_REQUEST });
    const { data } = await api.get("/api/products/");
    const list = Array.isArray(data) ? data : (data?.results || []);
    dispatch({ type: PRODUCTS_LIST_SUCCESS, payload: list });
  } catch (error) {
    dispatch({
      type: PRODUCTS_LIST_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    const { data } = await api.get(`/api/product/${id}/`);
    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

/* ---------------------------------------
   CREATE
   - Primary endpoint: /api/products/create/  (new)
   - Fallback to:      /api/product-create/    (old)
----------------------------------------*/
export const createProduct = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const token = pickToken(getState);
    const cfg = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    try {
      const { data } = await api.post("/api/products/create/", formData, cfg);
      dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
      return data;
    } catch (e) {
      if (e?.response?.status === 404) {
        const { data } = await api.post("/api/product-create/", formData, cfg);
        dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
        return data;
      }
      throw e;
    }
  } catch (error) {
    dispatch({
      type: CREATE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
    throw error;
  }
};

/* ---------------------------------------
   UPDATE
----------------------------------------*/
export const updateProduct = (id, formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const token = pickToken(getState);
    const cfg = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await api.put(`/api/product-update/${id}/`, formData, cfg);
    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

/* ---------------------------------------
   DELETE
----------------------------------------*/
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const token = pickToken(getState);
    const cfg = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await api.delete(`/api/product-delete/${id}/`, cfg);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

/* ---------------------------------------
   ORDER DELIVERY STATUS (ADMIN)
   Backend route today:
   /api/account/orders/<id>/status/
----------------------------------------*/
export const changeDeliveryStatus = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHANGE_DELIVERY_STATUS_REQUEST });

    const token = pickToken(getState);
    const cfg = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await api.put(`/api/account/orders/${id}/status/`, payload, cfg);
    dispatch({ type: CHANGE_DELIVERY_STATUS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHANGE_DELIVERY_STATUS_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};
   

