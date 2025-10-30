// src/pages/ReturnsPage.js
import React from "react";
import { Container } from "react-bootstrap";

export default function ReturnsPage() {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Politique de Retour</h1>
      <h4>Délai</h4>
      <p>
        Vous disposez de 14 jours après réception pour demander un retour si
        l’article est intact et non ouvert.
      </p>
      <h4>Procédure</h4>
      <ol>
        <li>Contactez-nous : labshaay@gmail.com (n° commande + motif)</li>
        <li>Attendez la validation et l’adresse de retour</li>
        <li>Renvoyez le colis, frais de retour à votre charge (sauf erreur de notre part)</li>
      </ol>
      
    </Container>
  );
}
