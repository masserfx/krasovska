import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <Container className="text-center">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Stránka nenalezena
        </h1>
        <p className="mt-2 text-muted">
          Omlouváme se, ale hledaná stránka neexistuje.
        </p>
        <div className="mt-8">
          <Button href="/" size="lg">
            Zpět na úvod
          </Button>
        </div>
      </Container>
    </section>
  );
}
