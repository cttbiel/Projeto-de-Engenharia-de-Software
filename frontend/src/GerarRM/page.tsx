import { useEffect, useState } from "react";
import { useUsuario } from "../contexts/UsuarioContext";
import { useRm, type ItemRM, type PrioridadeRM } from "../contexts/RmContext";

const MAX_ITENS = 10;

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function itemVazio(): ItemRM {
  return { id: gerarId(), descricao: "", quantidade: 1 };
}

/**
 * Tela 1 — Gerar RM (Solicitante / Engenheiro de Obra).
 * Formulário com cabeçalho, prioridade e lista dinâmica de itens (1–10).
 */
export default function GerarRM() {
  const { setTituloPagina } = useUsuario();
  const { salvarRmEnviada } = useRm();

  const [codigoSolicitante, setCodigoSolicitante] = useState("");
  const [nomeSolicitante, setNomeSolicitante] = useState("");
  const [dataPedido, setDataPedido] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [prioridade, setPrioridade] = useState<PrioridadeRM>("Normal");
  const [itens, setItens] = useState<ItemRM[]>([itemVazio()]);

  const [erros, setErros] = useState<string[]>([]);
  const [modalSucesso, setModalSucesso] = useState(false);

  useEffect(() => {
    setTituloPagina("Gerar RM — Requisição de Material");
  }, [setTituloPagina]);

  const adicionarItem = () => {
    if (itens.length >= MAX_ITENS) return;
    setItens((prev) => [...prev, itemVazio()]);
  };

  const removerItem = (id: string) => {
    if (itens.length <= 1) return;
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const atualizarItem = (id: string, patch: Partial<ItemRM>) => {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  };

  const validar = (): boolean => {
    const e: string[] = [];
    if (!codigoSolicitante.trim()) e.push("Informe o código do solicitante.");
    if (!nomeSolicitante.trim()) e.push("Informe o nome do solicitante.");
    if (!dataPedido) e.push("Informe a data do pedido.");
    if (itens.length < 1) e.push("Inclua pelo menos um item.");

    itens.forEach((item, idx) => {
      if (!item.descricao.trim()) {
        e.push(`Item ${idx + 1}: descrição é obrigatória.`);
      }
      if (!Number.isFinite(item.quantidade) || item.quantidade < 1) {
        e.push(`Item ${idx + 1}: quantidade deve ser ≥ 1.`);
      }
    });

    setErros(e);
    return e.length === 0;
  };

  const handleEnviar = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;

    salvarRmEnviada({
      codigoSolicitante: codigoSolicitante.trim(),
      nomeSolicitante: nomeSolicitante.trim(),
      dataPedido,
      prioridade,
      itens: itens.map((i) => ({
        ...i,
        descricao: i.descricao.trim(),
        quantidade: Math.floor(Number(i.quantidade)),
      })),
    });

    setModalSucesso(true);
  };

  return (
    <div className="max-w-3xl mx-auto text-left">
      <p className="text-gray-600 mb-6">
        Preencha os dados da requisição e a lista de materiais. Após o envio, a
        chefia poderá autorizar na tela <strong>Autorizar RM</strong>.
      </p>

      <form onSubmit={handleEnviar} className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-slate-50/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Cabeçalho
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Código do Solicitante *
              <input
                type="text"
                value={codigoSolicitante}
                onChange={(e) => setCodigoSolicitante(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ex.: ENG-042"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Nome do Solicitante *
              <input
                type="text"
                value={nomeSolicitante}
                onChange={(e) => setNomeSolicitante(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nome completo"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Data do Pedido *
              <input
                type="date"
                value={dataPedido}
                onChange={(e) => setDataPedido(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Prioridade *
              <select
                value={prioridade}
                onChange={(e) =>
                  setPrioridade(e.target.value as PrioridadeRM)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Itens da requisição ({itens.length}/{MAX_ITENS})
            </h2>
            <button
              type="button"
              onClick={adicionarItem}
              disabled={itens.length >= MAX_ITENS}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Adicionar item
            </button>
          </div>

          <ul className="space-y-4">
            {itens.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-end"
              >
                <span className="text-sm font-medium text-slate-500 sm:w-8">
                  {index + 1}.
                </span>
                <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
                  Descrição do item *
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) =>
                      atualizarItem(item.id, { descricao: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Descrição do material"
                  />
                </label>
                <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700 sm:w-32">
                  Quantidade *
                  <input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(item.id, {
                        quantidade: Number(e.target.value),
                      })
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removerItem(item.id)}
                  disabled={itens.length <= 1}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-40"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>

        {erros.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <ul className="list-disc list-inside space-y-1">
              {erros.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Enviar Requisição
          </button>
        </div>
      </form>

      {modalSucesso && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sucesso-titulo"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>
            <h2
              id="modal-sucesso-titulo"
              className="text-xl font-semibold text-slate-900"
            >
              Requisição enviada
            </h2>
            <p className="mt-2 text-slate-600">
              A RM foi encaminhada à chefia imediata para autorização (simulação).
            </p>
            <button
              type="button"
              onClick={() => setModalSucesso(false)}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
