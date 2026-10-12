import { redirect } from "next/navigation";

/** O Humor agora é uma aba do Diário. O endereço antigo continua levando até lá. */
export default function MoodPage() {
  redirect("/dashboard/diary?aba=humor");
}
