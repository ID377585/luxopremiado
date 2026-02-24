import { HomeRedirect } from "@/components/common/HomeRedirect";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return <HomeRedirect />;
}
