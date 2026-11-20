# BookHaven – Catálogo de Biblioteca

> Seu refúgio entre páginas.

Sistema web de catálogo para a **Biblioteca Comunitária BookHaven** (Recife – PE). O leitor descobre se um livro está **disponível** e **em qual estante ele fica**; a equipe **cadastra, edita, marca como perdido e remove** livros.

Feito só com **HTML, CSS e JavaScript puros** (ES Modules): sem framework, sem build, sem dependências. Os dados ficam no `localStorage` do navegador.

> Projeto acadêmico: Estudo de Caso 6 – Sistemas · Atividade de POO. Empresa e dados fictícios.

## Funcionalidades

- **CRUD completo** de livros e outros materiais (revista, DVD, mapa…)
- **Busca** por título, autor e ISBN (ignora acentos e maiúsculas)
- **Filtros** por categoria e status, com ordenação
- **Status:** disponível, emprestado e perdido
- **Painel da equipe:** indicadores, livros perdidos e histórico de atividades
- **Login e cadastro simulados**, com 3 perfis e permissões
- **Exportar / importar JSON** (backup e transferência do acervo)
- **Acessibilidade:** botões A+ / A−, alto contraste, navegação por teclado

## Como rodar

O Chrome e o Edge bloqueiam ES Modules em `file://`. Escolha uma opção:

```bash
# Opção 1: servidor local (qualquer navegador)
python -m http.server 8000
# abra http://localhost:8000

# Opção 2: abra o index.html no Firefox
```

## Usuários de demonstração

| Usuário | Senha | Perfil | Permissões |
|---|---|---|---|
| `silvia` | `silvia123` | Bibliotecária | Tudo, incluindo remover, importar e restaurar |
| `thiago` | `thiago123` | Auxiliar | Cadastrar, editar, status e perdido (sem remover, importar e restaurar) |
| `joao` | `joao123` | Leitor | Somente consulta |

Quem se cadastra pela tela **Criar conta** entra como Leitor.

## Estrutura

```
index.html
css/        variables · base · components · layout · tema
js/
  main.js   ponto de entrada
  models/   book.js (modelo e validação)
  data/     seed.js (32 livros) · users.js (perfis e permissões)
  services/ catalog.js (regras) · storage.js · auth.js · activity.js
  ui/       telas, formulários, modais e renderização do HTML
  utils/    helpers.js
tests/      teste-logica.mjs
```

**Camadas:** `ui` → `services/catalog.js` → `services/storage.js`. O `catalog.js` não usa o DOM, por isso roda no Node.

## Testes

```bash
node tests/teste-logica.mjs   # Node 18+
```

Cobre modelo, busca, CRUD, importação, falta de espaço, login, cadastro, permissões e painel.

## Limitações

- O `localStorage` comporta cerca de 17 mil livros (limite de ~5 MB); não há sincronização entre computadores.
- Login e cadastro são **simulados**: as senhas ficam visíveis no navegador, sem segurança real.
- O status *emprestado* é manual (não há controle de leitor, prazo ou histórico).
- Não testado com leitores de tela reais, Safari e hardware antigo.
