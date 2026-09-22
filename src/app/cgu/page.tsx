import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "CGU — Salon de la Danse" };

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <p className="text-sm text-gray-600">
        Version de démonstration (MVP). À faire relire et compléter par l'association avant mise
        en production.
      </p>

      <LegalSection heading="1. Objet">
        <p>
          La présente application permet aux bénévoles retenus de s'inscrire, de composer leur
          planning de missions et d'obtenir leur badge pour le Salon de la Danse.
        </p>
      </LegalSection>

      <LegalSection heading="2. Accès et compte">
        <p>
          L'inscription est réservée aux personnes disposant d'un code d'invitation valide, remis
          par l'association. Chaque personne ne peut créer qu'un seul compte. Les informations
          fournies doivent être exactes.
        </p>
      </LegalSection>

      <LegalSection heading="3. Engagement du bénévole">
        <p>
          En validant son planning, le bénévole s'engage à assurer les missions et créneaux
          réservés. Toute impossibilité doit être signalée à l'équipe organisatrice dans les
          meilleurs délais.
        </p>
      </LegalSection>

      <LegalSection heading="4. Badge et identification">
        <p>
          La photo d'identité fournie sert exclusivement à l'édition du badge nominatif, requis
          pour accéder aux zones bénévoles pendant l'évènement.
        </p>
      </LegalSection>

      <LegalSection heading="5. Responsabilités">
        <p>
          L'association s'efforce d'assurer la disponibilité du service mais ne saurait être tenue
          responsable d'une interruption temporaire. Le bénévole est responsable de la
          confidentialité de ses identifiants.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
