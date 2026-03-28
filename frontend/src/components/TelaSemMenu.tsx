import Cabecalho from "./Cabecalho";
import ConteudoSemMenu from "./ConteudoSemMenu";

interface TelaSemMenuProps {
  titulo: string;
  children: React.ReactNode; // Define corretamente o tipo dos filhos
}
const logado = false;
export default function TelaSemMenu({ children }: TelaSemMenuProps) {
  return (
    <div className="h-screen flex flex-col">
      <Cabecalho logado={logado} />
      <div className="flex flex-1 ">
          <ConteudoSemMenu>{children}</ConteudoSemMenu>
      </div>
    </div>
  );
}
