import { AuthCard } from "@/components/auth-card";
import { updatePassword } from "@/app/auth/actions";
export default function Update() {
  return (
    <AuthCard
      title="Defina uma nova senha"
      intro="Use uma senha longa e exclusiva para esta conta."
      footer={<>A sessão será mantida neste dispositivo.</>}
    >
      <form action={updatePassword} className="grid gap-4">
        <label>
          <span className="label">Nova senha</span>
          <input
            className="field"
            type="password"
            name="password"
            minLength={10}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit">
          Atualizar senha
        </button>
      </form>
    </AuthCard>
  );
}
