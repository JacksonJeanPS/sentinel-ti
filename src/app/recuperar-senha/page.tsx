import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { requestReset } from "@/app/auth/actions";
export default function Reset() {
  return (
    <AuthCard
      title="Recupere seu acesso"
      intro="Enviaremos um link se o endereço pertencer a uma conta."
      footer={<Link href="/entrar">Voltar para entrar</Link>}
    >
      <form action={requestReset} className="grid gap-4">
        <label>
          <span className="label">E-mail</span>
          <input className="field" type="email" name="email" required />
        </label>
        <button className="btn btn-primary" type="submit">
          Enviar instruções
        </button>
      </form>
    </AuthCard>
  );
}
