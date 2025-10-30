// src/pages/AboutPage.js
import React from "react";
import { Container } from "react-bootstrap";

export default function AboutPage() {
  return (
    <Container className="py-5">
      <h1 className="mb-4">À propos de nous</h1>
      <p>
        Miniglow by shay est une boutique en ligne de cosmétiques inspirés de la
        routine coréenne. Notre mission : proposer des soins efficaces,
        sûrs et accessibles pour une peau éclatante.
      </p>
      <p>
        Nous sélectionnons nos marques avec exigence (ingrédients, traçabilité,
        sécurité) et assurons un service client réactif.
      </p>
      <h3 className="mt-4">Nos engagements</h3>
      <ul>
        <li>Produits authentiques &amp; certifiés</li>
        <li>Transparence des ingrédients</li>
        <li>Expédition rapide et suivie</li>
        <li>SAV disponible par WhatsApp &amp; e-mail</li>
      </ul>
    </Container>
  );
}
