# Sistema de Requisição de Materiais e Compras - Protótipo 📦

Este repositório contém o protótipo funcional de frontend desenvolvido para a disciplina de Engenharia de Software I do curso de Engenharia de Computação (CEFET-MG). O projeto é o resultado da análise de requisitos e elicitação feita via sessões JAD (Joint Application Design) para modernizar e automatizar o fluxo de requisição e compras de uma construtora.

## 🚀 Escopo do Protótipo

O sistema (desenvolvido em React + Vite) foca em demonstrar as melhorias propostas para os dois principais fluxos iniciais do processo:

* **Gerar RM (Requisição de Material):** Interface para o Engenheiro de Obra (Solicitante) preencher os dados do pedido, adicionar múltiplos itens dinamicamente e definir a prioridade (Normal ou Urgente) para acelerar demandas críticas.
* **Autorizar RM:** Painel para a Chefia Imediata avaliar as requisições pendentes. Inclui a nova regra de negócio de Controle Orçamentário, sinalizando se o pedido está dentro do orçamento da gerência, com opções de Aprovar, Retornar para Alteração ou Cancelar.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, Vite
* **Deploy:** Vercel 
* **Modelagem de Requisitos:** UML (Diagramas de Caso de Uso e Atividades desenvolvidos no Astah).

## ⚙️ Como executar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/cttbiel/Projeto-de-Engenharia-de-Software.git](https://github.com/cttbiel/Projeto-de-Engenharia-de-Software.git)