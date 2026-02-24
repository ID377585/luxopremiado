import { UserArea } from "@/components/raffle/UserArea";
import { getSessionUser } from "@/lib/session";

export default async function UserAreaPage() {
  const user = await getSessionUser();

  return (
    <main>
      <UserArea userName={user?.name ?? user?.email} />
    </main>
  );
}
