import { useEffect, useState, lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Menu from "./Menu";
import Cabecalho from "./Cabecalho";
import Conteudo from "./Conteudo";
import { useUsuario } from "../contexts/UsuarioContext";

import {
  //importar aqui os menus implementados para cada papel eles devem estar na pasta Menu criamos aqui exemplos esporadicos pra voces com um
  //papel de adimistrador outro de Funcionario e outro de Gestor.
  Administrador,
  Func,
  Gestor,
} from "../Menu";

interface MenuItem {
  label: string;
  rota: string;
}

const getMenuJson = (idtPapel: string): MenuItem[] => {
  switch (idtPapel) {
    case "A":
      return Administrador;
    case "F":
      return Func;
    case "G":
      return Gestor;
  }

  return [];
};

export default function TelaPadrao() {
  const mostrarMenu = true;
  const [menuItens, setMenuItens] = useState<MenuItem[]>([]);
  const {
    idtPapel,
    /*tirar o setUsuario daqui quando tiver backend*/ setUsuario,
  } = useUsuario();

  // Atualiza menu dinamicamente ao mudar de perfil/papel
  useEffect(() => {
    const menu = getMenuJson(idtPapel);
    setMenuItens(menu);
  }, [idtPapel, setUsuario]);

  // Rotas com Conteudo como pai e páginas como filhos renderizadas no Outlet
  const element = useRoutes([
    {
      path: "/",
      element: <Conteudo />,
      children: menuItens.map(({ rota }) => {
        const Componente = lazy(
          () => import(`../${rota.substring(1)}/page.tsx`)
        );
        return {
          path: rota.substring(1),
          element: (
            <Suspense fallback={<div>Carregando...</div>}>
              <Componente />
            </Suspense>
          ),
        };
      }),
    },
    {
      path: "*",
      element: <div>Rota não encontrada</div>,
    },
  ]);

  return (
    <div className="h-screen flex flex-col">
      <Cabecalho logado={true} />
      <div className="flex flex-1">
        {mostrarMenu && <Menu itens={menuItens} />}
        {element}
      </div>
    </div>
  );
}
