import Image from "next/image";

import { PrizeData } from "@/types/raffle";
import styles from "@/components/raffle/sections.module.css";

interface PrizeProps {
  data: PrizeData;
}

export function Prize({ data }: PrizeProps) {
  return (
    <section className={styles.section} id="premio">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Prêmio</h2>
          <p className={styles.sectionSubtitle}>Visualização oficial do prêmio principal da campanha.</p>
        </header>

        <div className={styles.prizeGrid}>
          <div className={styles.prizeGallery}>
            {data.images.map((url, index) => (
              <div className={styles.prizeImageWrap} key={url}>
                <Image
                  alt={`${data.title} - imagem ${index + 1}`}
                  className={styles.prizeImage}
                  height={500}
                  src={url}
                  width={800}
                />
              </div>
            ))}
          </div>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>{data.title}</h3>
            <p className={styles.cardText}>{data.description}</p>
            <ul className={styles.featureList}>
              {data.features.map((feature) => (
                <li className={styles.featureItem} key={feature.label}>
                  <span>{feature.label}</span>
                  <strong>{feature.value}</strong>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
