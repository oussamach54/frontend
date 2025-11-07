// src/actions/productActions.js
import {
  PRODUCTS_LIST_REQUEST, PRODUCTS_LIST_SUCCESS, PRODUCTS_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST, PRODUCT_DETAILS_SUCCESS, PRODUCT_DETAILS_FAIL,
  CREATE_PRODUCT_REQUEST, CREATE_PRODUCT_SUCCESS, CREATE_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST, DELETE_PRODUCT_SUCCESS, DELETE_PRODUCT_FAIL,
  UPDATE_PRODUCT_REQUEST, UPDATE_PRODUCT_SUCCESS, UPDATE_PRODUCT_FAIL,
  CHANGE_DELIVERY_STATUS_REQUEST, CHANGE_DELIVERY_STATUS_SUCCESS, CHANGE_DELIVERY_STATUS_FAIL,
} from "../constants";
import api from "../api";

/* ---------- PUBLIC ---------- */
export const getProductsList = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCTS_LIST_REQUEST });
    const { data } = await api.get("/products/");
    dispatch({ type: PRODUCTS_LIST_SUCCESS, payload: data });
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
    const { data } = await api.get(`/product/${id}/`);
    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

/* ---------- AUTH ---------- */
export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    // Let the browser set the multipart boundary automatically
    const res = await api.post("/product-create/", formData);
    const { data, headers } = res;

    // ✅ Normalize ID for both local & prod
    let id =
      data?.id ??
      data?.pk ??
      data?.product?.id ??
      data?.product_id ??
      null;

    if (!id && headers?.location) {
      // supports Location: /api/product/123/
      const parts = String(headers.location).split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (/^\d+$/.test(last)) id = Number(last);
    }

    const payload = { ...data, id }; // ensure .id exists when possible
    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload });
  } catch (error) {
    dispatch({
      type: CREATE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

export const updateProduct = (id, formData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });
    const { data } = await api.put(`/product-update/${id}/`, formData);
    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });
    const { data } = await api.delete(`/product-delete/${id}/`);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};

export const changeDeliveryStatus = (id, payload) => async (dispatch) => {
  try {
    dispatch({ type: CHANGE_DELIVERY_STATUS_REQUEST });
    const { data } = await api.put(
      `/account/change-order-status/${id}/`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    dispatch({ type: CHANGE_DELIVERY_STATUS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHANGE_DELIVERY_STATUS_FAIL,
      payload: error?.response?.data?.detail || error.message,
    });
  }
};
