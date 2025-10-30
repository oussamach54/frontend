import React from 'react';
import BrandBar from './BrandBar';
import NavBar from './Navbar';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <BrandBar />
      <NavBar />
    </header>
  );
}
