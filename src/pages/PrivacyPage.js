// src/pages/PrivacyPage.js
import React from "react";
import { Container } from "react-bootstrap";

export default function PrivacyPage() {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Politique de confidentialité</h1>
      <p>
        Nous respectons votre vie privée. Cette page explique quelles données
        nous collectons (compte client, commandes, cookies analytiques) et dans
        quel but (exécution des commandes, amélioration du service).
      </p>
      <h4>Données collectées</h4>
      <ul>
        <li>Données de compte et commande</li>
        <li>Données de navigation (cookies techniques/analytiques)</li>
      </ul>
      <h4>Vos droits</h4>
      <p>
        Conformément à la réglementation, vous pouvez demander l’accès, la
        rectification ou la suppression de vos données&nbsp;:{" "}
        <a href="mailto:labshaay@gmail.com">labshaay@gmail.com</a>.
      </p>
      <p className="text-muted small mt-4">
        * Modèle simplifié — adapte le contenu selon ta juridiction (RGPD, etc.).
      </p>
    </Container>
  );
}
