import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">Erreur 404</p>
      <h1 className="font-display text-5xl text-ink sm:text-7xl">
        Faux pas : <em className="text-accent">cette page n'existe pas.</em>
      </h1>
      <ButtonLink href="/">Retour à l'accueil</ButtonLink>
    </Container>
  );
}
