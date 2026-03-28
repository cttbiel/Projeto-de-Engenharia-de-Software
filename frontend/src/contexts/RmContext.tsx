import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Prioridade da RM (melhoria: definir na geração). */
export type PrioridadeRM = "Normal" | "Urgente";

export interface ItemRM {
  id: string;
  descricao: string;
  quantidade: number;
}

/** Dados completos da RM exibidos na autorização (valor/orçamento são mock). */
export interface RequisicaoMaterial {
  codigoSolicitante: string;
  nomeSolicitante: string;
  dataPedido: string;
  prioridade: PrioridadeRM;
  itens: ItemRM[];
  /** Valor estimado fictício para o indicador orçamentário. */
  valorEstimado: number;
  /** Indica se o mock está dentro do limite de orçamento. */
  dentroDoOrcamento: boolean;
}

interface RmContextValue {
  rmPendente: RequisicaoMaterial | null;
  /** Salva a RM após o envio pelo solicitante (calcula valor/orçamento mock). */
  salvarRmEnviada: (dados: Omit<RequisicaoMaterial, "valorEstimado" | "dentroDoOrcamento">) => void;
  /** Remove a RM após decisão final do supervisor (protótipo). */
  limparRm: () => void;
}

const STORAGE_KEY = "rm_prototipo_pendente";

const RmContext = createContext<RmContextValue | undefined>(undefined);

function calcularValorEMock(
  itens: ItemRM[],
  prioridade: PrioridadeRM
): { valorEstimado: number; dentroDoOrcamento: boolean } {
  // Valor fictício: soma simples (quantidade × custo unitário simulado).
  const valorEstimado = itens.reduce((acc, item) => acc + item.quantidade * 250, 0);
  // Limite mock de orçamento; prioridade urgente força cenário de extrapolação para demonstração.
  const limiteOrcamento = 5000;
  const dentroDoOrcamento =
    prioridade === "Urgente" ? false : valorEstimado <= limiteOrcamento;
  return { valorEstimado, dentroDoOrcamento };
}

function loadFromStorage(): RequisicaoMaterial | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RequisicaoMaterial;
  } catch {
    return null;
  }
}

export function RmProvider({ children }: { children: ReactNode }) {
  const [rmPendente, setRmPendente] = useState<RequisicaoMaterial | null>(() =>
    loadFromStorage()
  );

  const salvarRmEnviada = useCallback(
    (dados: Omit<RequisicaoMaterial, "valorEstimado" | "dentroDoOrcamento">) => {
      const { valorEstimado, dentroDoOrcamento } = calcularValorEMock(
        dados.itens,
        dados.prioridade
      );
      const completa: RequisicaoMaterial = {
        ...dados,
        valorEstimado,
        dentroDoOrcamento,
      };
      setRmPendente(completa);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(completa));
    },
    []
  );

  const limparRm = useCallback(() => {
    setRmPendente(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ rmPendente, salvarRmEnviada, limparRm }),
    [rmPendente, salvarRmEnviada, limparRm]
  );

  return <RmContext.Provider value={value}>{children}</RmContext.Provider>;
}

export function useRm() {
  const ctx = useContext(RmContext);
  if (!ctx) {
    throw new Error("useRm deve ser usado dentro de RmProvider");
  }
  return ctx;
}
