import { HowItWorksStep } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section className={styles.section} id="como-funciona">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Como Funciona</h2>
          <p className={styles.sectionSubtitle}>Fluxo pensado para compra rápida, segura e rastreável.</p>
        </header>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article className={styles.stepCard} key={step.title}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
