import styles from "@/components/auth/auth.module.css";
import { getMyProfile } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getSessionUser();
  const profile = await getMyProfile(user?.id ?? "");

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <strong>Nome</strong>
        <span>{profile.name ?? "Não definido"}</span>
      </article>

      <article className={styles.panel}>
        <strong>E-mail</strong>
        <span>{user?.email ?? "demo@luxopremiado.com.br"}</span>
      </article>

      <article className={styles.panel}>
        <strong>Telefone</strong>
        <span>{profile.phone ?? "Não definido"}</span>
      </article>

      <article className={styles.panel}>
        <strong>Função</strong>
        <span>{profile.role}</span>
      </article>

      <article className={styles.panel}>
        <strong>Observação</strong>
        <p>Este scaffold já está pronto para evoluir para edição de perfil com Server Actions.</p>
      </article>
    </section>
  );
}
