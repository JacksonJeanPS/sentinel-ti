import { HistoryList } from "@/components/history-list";
export const metadata = { title: "Histórico" };
export default function History() {
  return (
    <>
      <h1 className="text-3xl font-bold">Histórico</h1>
      <p className="muted mb-7 mt-2">
        Pesquise e filtre as análises armazenadas.
      </p>
      <HistoryList />
    </>
  );
}
