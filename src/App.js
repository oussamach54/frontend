import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProductsListPage from "./pages/ProductsListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductUpdatePage from "./pages/ProductUpdatePage";

import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage"; // ✅ fixed filename

import PaymentStatus from "./components/PaymentStatus";
import NavBar from "./components/Navbar";
import BrandBar from "./components/BrandBar";
import WishlistPage from "./pages/WishlistPage";
import ShippingRatesPage from "./pages/ShippingRatesPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";          // ✅ added
import ResetPasswordConfirmPage from "./pages/ResetPasswordConfirmPage"; // ✅ added

import AccountPage from "./pages/AccountPage";
import AccountUpdatePage from "./pages/AccountUpdatePage";
import DeleteUserAccountPage from "./pages/DeleteUserAccountPage";
import CardDetailsPage from "./pages/CardDetailsPage";
import CardUpdatePage from "./pages/CardUpdatePage";
import AllAddressesOfUserPage from "./pages/AllAddressesOfUserPage";
import AddressUpdatePage from "./pages/AddressUpdatePage";
import OrdersListPage from "./pages/OrdersListPage";
import NotFound from "./pages/NotFoundPage";
import BrandsPage from "./pages/BrandsPage";
import BrandCollectionPage from "./pages/BrandCollectionPage";
import TopBar from "./components/TopBar";
import "./App.css";

/* 🛒 Cart (global) */
import CartProvider from "./cart/CartProvider";
import CartDrawer from "./components/CartDrawer";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReturnsPage from "./pages/ReturnsPage";

import CheckoutCODPage from "./pages/CheckoutCODPage";
import MyOrdersPage from "./pages/OrdersMyPage";
import AdminOrdersPage from "./pages/AdminOrdersPage"; // optionnel
import OrderDetailPage from "./pages/OrderDetailPage"; 
import AdminOrderDetailPage from "./pages/AdminOrderDetailPage";
import ThankYouPage from "./pages/ThankYouPage";


const App = () => {
  return (
    <Router>
      {/* Barre promo tout en haut */}
      <TopBar />

      <CartProvider>
        {/* Header avec logo + nav */}
        <header className="site-header">
          <BrandBar />
          <NavBar />
        </header>

        {/* Drawer panier */}
        <CartDrawer />

        <div className="container mt-4">
          <Switch>
            {/* ===== AUTH ===== */}
            <Route path="/login" exact component={LoginPage} />
            <Route path="/register" exact component={RegisterPage} />
            <Route path="/forgot-password" exact component={ForgotPasswordPage} /> {/* ✅ */}
            <Route
              path="/reset-password/:uid/:token"
              exact
              component={ResetPasswordConfirmPage}
            /> {/* ✅ */}

            {/* ===== PRODUITS ===== */}
            <Route path="/" exact component={HomePage} />
            <Route path="/products" exact component={ProductsListPage} />
            <Route path="/product/:id/" exact component={ProductDetailsPage} />
            <Route path="/new-product/" exact component={ProductCreatePage} />
            <Route path="/product-update/:id/" exact component={ProductUpdatePage} />

            {/* ===== PANIER & CHECKOUT ===== */}
            <Route path="/cart" exact component={CartPage} />
            <Route path="/checkout" exact component={CheckoutPage} />
            <Route path="/product/:id/checkout/" exact component={CheckoutPage} />

            {/* ===== COMPTE & COMMANDES ===== */}
            <Route path="/payment-status" exact component={PaymentStatus} />
            <Route path="/account" exact component={AccountPage} />
            <Route path="/account/update/" exact component={AccountUpdatePage} />
            <Route path="/account/delete/" exact component={DeleteUserAccountPage} />
            <Route path="/stripe-card-details" exact component={CardDetailsPage} />
            <Route path="/stripe-card-update" exact component={CardUpdatePage} />
            <Route path="/all-addresses/" exact component={AllAddressesOfUserPage} />
            <Route path="/all-addresses/:id/" exact component={AddressUpdatePage} />
            <Route path="/all-orders/" exact component={OrdersListPage} />

            {/* ===== MARQUES ===== */}
            <Route path="/brands" exact component={BrandsPage} />
            <Route path="/brand/:slug" exact component={BrandCollectionPage} />

            {/* ===== DIVERS ===== */}
            <Route path="/contact" exact component={ContactPage} />
            <Route path="/about" exact component={AboutPage} />
            <Route path="/privacy" exact component={PrivacyPage} />
            <Route path="/returns" exact component={ReturnsPage} />
            <Route path="/wishlist" exact component={WishlistPage} />
            <Route path="/shipping" exact component={ShippingRatesPage} />
            <Route path="/checkout-cod" component={CheckoutCODPage} />
            <Route path="/orders" component={MyOrdersPage} exact />
            <Route path="/order/:id" component={OrderDetailPage} exact />
            <Route path="/admin/orders" component={AdminOrdersPage} exact />
            <Route path="/admin/orders/:id/" exact component={AdminOrderDetailPage} />
            <Route path="/thank-you" exact component={ThankYouPage} />

            

            {/* 404 fallback */}
            <Route component={NotFound} />
          </Switch>
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;
