import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { useRm } from "../contexts/RmContext";

const fmtBrl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v
  );

function formatarDataBr(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/**
 * Tela 2 — Autorizar RM (Chefia imediata / Supervisor).
 * Exibe a RM mockada, indicador orçamentário e decisões: aprovar, retornar, cancelar.
 */
export default function AutorizarRM() {
  const { setTituloPagina } = useUsuario();
  const { rmPendente, limparRm } = useRm();

  const [modal, setModal] = useState<
    null | "aprovar" | "retornar" | "cancelar"
  >(null);
  const [justificativa, setJustificativa] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setTituloPagina("Autorizar RM — Decisão da chefia");
  }, [setTituloPagina]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const abrirRetornar = () => {
    setJustificativa("");
    setModal("retornar");
  };

  const confirmarRetorno = () => {
    const j = justificativa.trim();
    if (j.length < 5) {
      setToast("Informe uma justificativa (mínimo 5 caracteres).");
      return;
    }
    setModal(null);
    limparRm();
    setToast(
      `RM retornada ao solicitante para alteração. Justificativa registrada (simulação).`
    );
  };

  const confirmarAprovar = () => {
    setModal(null);
    limparRm();
    setToast("RM aprovada e encaminhada ao Almoxarifado (simulação).");
  };

  const confirmarCancelar = () => {
    setModal(null);
    limparRm();
    setToast("RM cancelada (simulação).");
  };

  if (!rmPendente) {
    return (
      <div className="max-w-xl mx-auto text-left rounded-xl border border-amber-200 bg-amber-50/90 p-8">
        <h2 className="text-lg font-semibold text-amber-900">
          Nenhuma RM pendente
        </h2>
        <p className="mt-2 text-amber-800">
          Não há requisição aguardando autorização. Gere uma nova RM na tela de
          solicitante e envie para a chefia.
        </p>
        <Link
          to="/GerarRM"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Ir para Gerar RM
        </Link>
      </div>
    );
  }

  const { dentroDoOrcamento, valorEstimado } = rmPendente;

  return (
    <div className="max-w-3xl mx-auto text-left space-y-6">
      {/* Indicador orçamentário (mock) */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          dentroDoOrcamento
            ? "border-emerald-200 bg-emerald-50"
            : "border-orange-300 bg-orange-50"
        }`}
      >
        <div>
          <p className="text-sm font-medium text-slate-600">
            Valor estimado (mock)
          </p>
          <p className="text-xl font-bold text-slate-900">
            {fmtBrl(valorEstimado)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
            dentroDoOrcamento
              ? "bg-emerald-600 text-white"
              : "bg-orange-600 text-white"
          }`}
        >
          {dentroDoOrcamento
            ? "Dentro do Orçamento"
            : "Extrapola o Orçamento"}
        </span>
      </div>

      {/* Resumo da RM */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Dados da requisição
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Código do solicitante</dt>
            <dd className="font-medium text-slate-900">
              {rmPendente.codigoSolicitante}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-medium text-slate-900">
              {rmPendente.nomeSolicitante}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Data do pedido</dt>
            <dd className="font-medium text-slate-900">
              {formatarDataBr(rmPendente.dataPedido)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Prioridade</dt>
            <dd>
              <span
                className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${
                  rmPendente.prioridade === "Urgente"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {rmPendente.prioridade}
              </span>
            </dd>
          </div>
        </dl>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-700">
          Itens solicitados
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Descrição</th>
                <th className="px-3 py-2 text-right font-medium">Qtd.</th>
              </tr>
            </thead>
            <tbody>
              {rmPendente.itens.map((item, i) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-600">{i + 1}</td>
                  <td className="px-3 py-2 text-slate-900">{item.descricao}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {item.quantidade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => setModal("aprovar")}
          className="flex-1 min-w-[10rem] rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Aprovar
        </button>
        <button
          type="button"
          onClick={abrirRetornar}
          className="flex-1 min-w-[10rem] rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600"
        >
          Retornar para Alteração
        </button>
        <button
          type="button"
          onClick={() => setModal("cancelar")}
          className="flex-1 min-w-[10rem] rounded-lg bg-slate-600 px-4 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Cancelar RM
        </button>
      </div>

      {/* Modal aprovar */}
      {modal === "aprovar" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirmar aprovação
            </h3>
            <p className="mt-2 text-slate-600">
              A RM será encaminhada ao Almoxarifado para atendimento (simulação).
            </p>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-slate-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmarAprovar}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Confirmar aprovação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal retornar — justificativa */}
      {modal === "retornar" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Retornar para alteração
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Informe a justificativa para o solicitante (mínimo 5 caracteres).
            </p>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Ex.: Ajustar quantidades conforme planilha de consumo..."
            />
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-slate-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRetorno}
                className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
                disabled={justificativa.trim().length < 5}
              >
                Enviar retorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelar */}
      {modal === "cancelar" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Cancelar requisição
            </h3>
            <p className="mt-2 text-slate-600">
              O pedido será cancelado e não seguirá no fluxo (simulação).
            </p>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-slate-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmarCancelar}
                className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast simples */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-lg bg-slate-900 px-6 py-3 text-center text-sm text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
