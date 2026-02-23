import styles from "@/components/auth/auth.module.css";

interface AuthMessageProps {
  error?: string;
  success?: string;
}

export function AuthMessage({ error, success }: AuthMessageProps) {
  if (!error && !success) {
    return null;
  }

  if (error) {
    return <p className={`${styles.message} ${styles.error}`}>{error}</p>;
  }

  return <p className={`${styles.message} ${styles.success}`}>{success}</p>;
}
