import styles from "@/components/auth/auth.module.css";

export default function AdminProofsPage() {
  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Provas sociais</strong>
        <p>Cadastre ganhadores, depoimentos e prints por campanha na tabela `social_proof`.</p>
      </article>
      <article className={styles.panel}>
        <strong>Mídia</strong>
        <p>Armazene arquivos no Supabase Storage e referencie o `media_url` na tabela.</p>
      </article>
    </section>
  );
}
