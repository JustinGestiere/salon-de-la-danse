import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Confidentialité (RGPD) — Salon de la Danse" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité (RGPD)">
      <p className="text-sm text-gray-600">
        Version de démonstration (MVP). À faire relire et compléter par l'association avant mise
        en production.
      </p>

      <LegalSection heading="Données collectées">
        <p>
          Nous collectons : nom, prénom, adresse e-mail, numéro de téléphone, date de naissance et
          photo d'identité. Ces données sont nécessaires à la gestion des bénévoles et à l'édition
          des badges.
        </p>
      </LegalSection>

      <LegalSection heading="Finalités">
        <p>
          Les données servent uniquement à organiser la participation bénévole : inscription,
          planning, badge nominatif et communication liée à l'évènement. Elles ne sont ni vendues
          ni cédées à des tiers.
        </p>
      </LegalSection>

      <LegalSection heading="Photo d'identité">
        <p>
          La photo est stockée de façon sécurisée sur nos serveurs, utilisée pour le seul badge, et
          n'est pas rendue publique.
        </p>
      </LegalSection>

      <LegalSection heading="Durée de conservation">
        <p>
          Les données sont conservées le temps de l'édition en cours puis archivées, et supprimées
          sur demande ou à l'issue de la durée légale de conservation définie par l'association.
        </p>
      </LegalSection>

      <LegalSection heading="Consentement">
        <p>
          L'acceptation des CGU et de la présente politique est recueillie et horodatée lors de
          l'inscription.
        </p>
      </LegalSection>

      <LegalSection heading="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour
          l'exercer, contactez l'équipe organisatrice, qui traitera votre demande via
          l'administration de l'application.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
