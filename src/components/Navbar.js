// src/components/NavBar.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './navbar.css';

function NavBar() {
  const { userInfo } = useSelector((state) => state.userLoginReducer) || {};
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll(); // initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`navstrip-wrap ${scrolled ? 'is-scrolled' : ''}`}>
      <Navbar
        expand="lg"
        className={`custom-navbar font-sans ${scrolled ? 'is-scrolled' : ''}`}
      >
        <Container>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto align-items-lg-center">
              <LinkContainer to="/">
                <Nav.Link className="nav-link-upp fw-600">ACCEUIL</Nav.Link>
              </LinkContainer>

              <NavDropdown
                title={<span className="nav-link-upp fw-600">TOUS LES PRODUITS</span>}
                id="all-products"
                menuVariant="light"
              >
                <LinkContainer to="/products">
                  <NavDropdown.Item className="font-sans">Tous</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/products?type=face"><NavDropdown.Item>Visage</NavDropdown.Item></LinkContainer>
                <LinkContainer to="/products?type=lips"><NavDropdown.Item>Lèvres</NavDropdown.Item></LinkContainer>
                <LinkContainer to="/products?type=eyes"><NavDropdown.Item>Yeux</NavDropdown.Item></LinkContainer>
                <LinkContainer to="/products?type=eyebrow"><NavDropdown.Item>Sourcils</NavDropdown.Item></LinkContainer>
                <LinkContainer to="/products?type=hair"><NavDropdown.Item>Cheveux</NavDropdown.Item></LinkContainer>
              </NavDropdown>

              <LinkContainer to="/brands">
                <Nav.Link className="nav-link-upp fw-600">MARQUES</Nav.Link>
              </LinkContainer>

              <LinkContainer to="/contact">
                <Nav.Link className="nav-link-upp fw-600">CONTACT</Nav.Link>
              </LinkContainer>

              <LinkContainer to="/shipping">
                <Nav.Link className="nav-link-upp fw-600">TARIFS DE LIVRAISON</Nav.Link>
              </LinkContainer>

              {userInfo && userInfo.admin && (
                <LinkContainer to="/new-product/">
                  <Nav.Link className="nav-link-upp ml-lg-3 fw-700 text-uppercase">
                    AJOUTER PRODUIT
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
