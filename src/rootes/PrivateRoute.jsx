// src/rootes/PrivateRoute.jsx
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute({ component: Component, ...rest }) {
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  return (
    <Route
      {...rest}
      render={(props) =>
        userInfo ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={`/login?redirect=${encodeURIComponent(
              props.location.pathname + props.location.search
            )}`}
          />
        )
      }
    />
  );
}
