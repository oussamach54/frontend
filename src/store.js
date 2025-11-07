// src/store.js
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import axios from 'axios';
import allReducers from './reducers/index';

const middleware = [thunk];

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// ⬇️ set axios default Authorization header if we have a token
if (userInfoFromStorage?.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${userInfoFromStorage.token}`;
} else if (userInfoFromStorage?.access) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${userInfoFromStorage.access}`;
}

const initialState = {
  userLoginReducer: { userInfo: userInfoFromStorage },
};

const store = createStore(
  allReducers,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
