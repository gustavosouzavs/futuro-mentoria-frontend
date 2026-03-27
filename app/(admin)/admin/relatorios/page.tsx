export const metadata = {
  title: "Relatórios | Admin",
  description: "Gerar relatórios de mentorias (PDF e XLSX).",
};

import { RelatoriosClient } from "./relatorios-client";

export default function Page() {
  return <RelatoriosClient />;
}

