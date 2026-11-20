# BookHaven – Catálogo de Biblioteca

> *Seu refúgio entre páginas.*

Sistema web de catálogo para a **Biblioteca Comunitária BookHaven** (Recife – PE, desde 1987).
Leitores descobrem se um livro está **disponível** e **em qual estante ele fica**; a equipe
cadastra, atualiza, marca como **perdido** e **remove** livros do acervo.

Feito só com **HTML, CSS e JavaScript puros** (ES6+): sem framework, sem build, sem npm, sem
biblioteca externa. Estudo de Caso 6 – Sistemas · Atividade de POO (empresa e dados fictícios).

| | |
|---|---|
| Peso do código (HTML + CSS + JS) | ~120 KB (≈ 35 KB compactado) + logo de 56 KB |
| Dependências | nenhuma |
| Dados | `localStorage` do navegador (sem servidor) |
| Telas | 3: **Início · Catálogo · Gerenciar** |

---

## Como rodar

**Opção 1 — Firefox:** dê duplo clique em `index.html`.

**Opção 2 — qualquer navegador (recomendada no Chrome e no Edge):** o Chrome e o Edge bloqueiam
*ES Modules* quando a página é aberta direto do arquivo (`file://`). Sirva a pasta com um servidor
estático simples e abra `http://localhost:8000`:

```bash
# na pasta do projeto, com Python instalado
python -m http.server 8000        # no Windows também funciona: py -m http.server 8000
```

(Outras formas: extensão *Live Server* do VS Code, `npx serve`, etc.) Se o navegador não conseguir
carregar os módulos, o próprio `index.html` mostra um aviso explicando isso.

> **Atenção:** o navegador guarda os dados **por endereço**. O que for cadastrado em
> `http://localhost:8000` não aparece em `file://…/index.html` nem em outro computador.
> Para levar o acervo de um lugar a outro, use **Exportar JSON** e **Importar JSON**.

**Funciona offline?** Sim. Depois que os arquivos estão na máquina, nada é buscado na internet.
Apenas as fontes (Lora e Source Sans 3) vêm do Google Fonts; sem internet, o navegador usa
**Georgia** e **system-ui** automaticamente, e a página não trava esperando por elas.

**Testes da lógica** (Node 18+, não é necessário para usar o sistema):

```bash
node tests/teste-logica.mjs       # 109 verificações: modelo, busca, CRUD, importação, falta de espaço, login, cadastro, permissões, painel
```

---

## Estrutura de pastas

```
index.html                 as telas (Entrar, Criar conta, Início, Catálogo, Painel, Gerenciar), o cabeçalho, o rodapé e os modais (<dialog>)
assets/
  logo-6-bookhaven.png     logomarca oficial (o cabeçalho agora usa um logo em SVG + texto, como no Figma)
css/
  variables.css            tokens: paleta, fontes, espaços, sombras (e alto contraste)
  base.css                 reset, tipografia (base 18px), foco visível, skip-link
  components.css           botões, campos, badges, selo raro, capas, modal, toast, tabela…
  layout.css               cabeçalho, telas, grades, tabela responsiva, formulário
  tema.css                 VISUAL DO FIGMA (carregado por último): fundo escuro, fichas, carimbos, gavetas
js/
  main.js                  PONTO DE ENTRADA (~45 linhas): guarda de acesso, menu por perfil e partida das telas
  models/
    book.js                o que é um livro válido: campos, validação, função fábrica criarLivro()
  data/
    seed.js                32 livros de exemplo (primeira abertura)
    users.js               usuários, perfis e permissões MOCKADOS + telas protegidas (todas, menos Entrar/Criar conta)
  services/
    storage.js             lê/grava no localStorage; exporta/importa JSON; restaura o exemplo
    catalog.js             REGRAS DO CATÁLOGO: buscar, filtrar, ordenar, criar, atualizar, excluir…
    auth.js                LOGIN e CADASTRO SIMULADOS: entrar, sair, cadastrar, contas e perfis, pode(acao)
    activity.js            registro de atividades da equipe (quem fez o quê, quando)
  ui/
    render.js              monta o HTML dos livros (Início, Catálogo, ficha), sempre com escape
    render-equipe.js       monta o HTML da equipe: tabela do Gerenciar, Painel, contas e menu do usuário
    inicio.js              tela Início: busca ao vivo, gavetas, novidades, raras
    catalogo.js            tela Catálogo: estado dos filtros, grade, "Mostrar mais"
    gerenciar.js           tela Gerenciar: tabela com busca e filtro
    painel.js              tela Painel: indicadores, atividade, contas e perfis
    acoes-livro.js         ações da equipe: formulário, status, perdido, remover, exportar/importar/restaurar
    atualizacao.js         "quadro de avisos": cada tela se registra e é redesenhada após qualquer mudança
    ficha.js               janela com a ficha do livro
    forms.js               formulário de livro: montar, ler, mostrar erros
    modal.js               abrir/fechar <dialog> e confirmar() com Promise
    navigation.js          troca de tela por #hash, foco, título da aba e guarda de acesso
    login.js               telas Entrar e Criar conta: formulários, erros, botão Sair
    fontSize.js            botões A+ / A− com preferência salva
    toast.js               avisos rápidos
  utils/
    helpers.js             gerarId, normalizarTexto, escaparHtml, formatarLocalizacao, debounce
tests/
  teste-logica.mjs         testes da lógica, sem bibliotecas
```

### Camadas (quem pode falar com quem)

```
 interface (ui/, main.js)  ──►  regras (services/catalog.js)  ──►  dados (services/storage.js)
        │                                │                                   │
   monta HTML e                   NÃO toca no DOM                   só sabe do localStorage
   trata eventos                  usa o modelo (book.js)
```

Cada camada pode ser explicada e testada sozinha: `catalog.js` roda no Node sem navegador
(é o que `tests/teste-logica.mjs` faz).

---

## Decisões de design

**Identidade visual (do briefing).** Verde Biblioteca `#1F4D3A` (menus, botões), Bordô
Encadernação `#7B2D26` (status *perdido* e remoção), Dourado Antigo `#C9A227` (detalhes e obras
raras), Pergaminho `#F5EEDC` (fundo), Marrom Café `#4A3728` (textos). Títulos em **Lora Bold**,
textos em **Source Sans 3**. A direção foi *biblioteca clássica com acabamento moderno*: cartões
arredondados, sombras suaves, transições discretas, mobile-first.

**A cor nunca fala sozinha.** Badges de status têm cor **e** texto **e** uma bolinha; capas de
livros perdidos ficam apagadas; a capa dourada é exclusiva das obras raras e o bordô é reservado
a "perdido" e "remover", para a cor da capa nunca ser confundida com um aviso.

**Capas só com CSS.** Gradiente da paleta + título e autor, sem imagens externas: nada para baixar,
nada para quebrar offline.

**Poucas telas e sem menus escondidos.** O sistema abre na tela **Entrar**; quem ainda não tem conta
vai em **Criar conta**. Depois de entrar, cada ação leva no máximo 2 cliques:
buscar → ver a ficha; "Novo livro" → salvar; "Marcar como perdido" → confirmar.

**Segurança.** Todo texto de livro passa por `escaparHtml()` antes de entrar no HTML (ou usa
`textContent`). Testado com um título `<img src=x onerror=…>`: aparece como texto, nada executa.

**Imutabilidade.** `criarLivro()` devolve um objeto congelado (`Object.freeze`); para "alterar"
um livro, o sistema cria um novo (`{ ...antigo, ...mudanças }`) e o revalida. Assim nenhuma
edição escapa da validação.

**Desempenho em computador antigo.** O Catálogo desenha 48 capas por vez ("Mostrar mais") e a
tabela do Gerenciar 50 linhas; a busca tem *debounce* de 250 ms. Medido com 3 000 livros: filtrar
≈ 30 ms, ordenar ≈ 100 ms, "Mostrar mais" ≈ 45 ms.

**Acessibilidade (Seu João, 8 a 80 anos).**
- Texto base de 18 px; **A+ / A−** de 16 a 28 px, salvo no `localStorage`. Tudo usa `rem`, então a
  página inteira acompanha. Testado a 28 px em telas de 320 e 375 px, sem rolagem horizontal.
- Contraste medido (WCAG 2.x), valores sobre os fundos reais da interface:

  | Par de cores | Razão | Nível |
  |---|---|---|
  | Marrom Café sobre Pergaminho (texto padrão) | 9,7 : 1 | AAA |
  | Verde sobre Pergaminho (títulos) | 8,3 : 1 | AAA |
  | Branco sobre Verde / sobre Bordô (botões) | 9,6 : 1 / 9,3 : 1 | AAA |
  | Texto suave `#6E5A49` sobre Pergaminho | 5,6 : 1 | AA |
  | Badge *emprestado* (`#7A5F0A` sobre fundo dourado claro) | 5,1 : 1 | AA |
  | Borda de campo `#85704F` sobre o fundo | 4,7 : 1 | ≥ 3 : 1 (componente de interface) |
  | Slogan dourado sobre o rodapé verde | 4,0 : 1 | só texto grande (é negrito de 20 px) |

  **O dourado `#C9A227` sobre o pergaminho dá apenas 2,1 : 1, por isso nunca é usado como cor de
  texto**, só em detalhes decorativos e no selo (onde o texto é marrom). Dois ajustes vieram da
  medição: a borda dos campos (antes 1,5 : 1) e a capa dourada (antes 3,0 : 1) foram escurecidas.
- HTML semântico (`header`, `nav`, `main`, `footer`, `h1` por tela, tabela com `caption` e
  `th scope`), `<label>` em todos os campos, `aria-required`, `aria-invalid` e
  `aria-describedby` ligando cada campo à sua mensagem de erro.
- Teclado: link "Pular para o conteúdo"; foco visível (anel dourado de 3 px); ao trocar de tela
  o foco vai ao título; **Esc fecha todos os modais** e devolve o foco a quem o abriu.
- `aria-live` nos avisos (toasts), nos resultados da busca e nos contadores.
- Respeita `prefers-reduced-motion` (sem animações) e `prefers-contrast: more` (cores mais fortes).

---

## Login, cadastro e perfis (Etapa 6)

**O sistema abre na tela Entrar.** Sem login só existem duas telas: **Entrar** e **Criar conta**.
Início, Catálogo e Gerenciar exigem login (`TELAS_PROTEGIDAS` em `js/data/users.js`).

**Fluxo:** Entrar → (sem conta) Criar conta → *conta criada* → volta para **Entrar** com o usuário já
preenchido → Início.

| Usuário | Senha | Perfil | Pode |
|---|---|---|---|
| `silvia` | `silvia123` | Bibliotecária | consultar tudo, abrir o Gerenciar e fazer tudo: cadastrar, editar, status, perdido, **remover, importar, restaurar**, exportar |
| `thiago` | `thiago123` | Auxiliar | consultar, abrir o Gerenciar e cadastrar, editar, status, perdido, exportar (**sem** remover, importar e restaurar) |
| `joao` | `joao123` | Leitor | só consultar (conta fixa de demonstração, o Seu João) |
| *(quem se cadastra)* | *(escolhida no cadastro)* | Leitor | **só consultar** Início e Catálogo; o Gerenciar não aparece no menu |

- **Cadastro:** nome, usuário (3 a 20 caracteres: letras sem acento, números, `.`, `-`, `_`), senha (mínimo 6) e
  confirmação. Recusa usuário repetido (inclusive os fixos: Silvia, Thiago e João). A conta **não entra
  sozinha**: o cadastro leva para o login. As contas ficam no `localStorage` (`bookhaven:usuarios`).
- Tentar abrir qualquer tela protegida sem login leva a **Entrar**; depois de entrar, a pessoa vai para a
  tela que queria. Um leitor que tenta abrir `#gerenciar` é desviado para o Catálogo.
- A **sessão** fica no `sessionStorage` (só o id, nunca a senha) e some ao fechar a aba. Os **dados do
  acervo** não são apagados ao sair.
- **Permissões em duas camadas:** a interface esconde o que o perfil não pode, e cada ação **confere de
  novo** com `exigir()` antes de executar. Um botão forjado no DevTools é barrado.
- A mensagem de erro do login é a mesma para usuário inexistente e senha errada.
- Nomes digitados aparecem sempre como texto (`escaparHtml`/`textContent`): `<b>` no nome não vira HTML.

> **Atenção ao briefing:** o estudo de caso quer que o leitor ache livros rápido. Exigir login para
> consultar acrescenta um passo; por isso o cadastro é curto e o login já vem com o usuário preenchido.
> Para voltar ao Catálogo aberto, basta tirar `'inicio'` e `'catalogo'` de `TELAS_PROTEGIDAS`.

## Área administrativa da equipe (Painel)

Quem é da equipe (bibliotecária e auxiliar) cai no **Painel** ao entrar; o leitor cai no **Início** (busca)
e **não vê** Painel nem Gerenciar. O Painel serve à meta de *inventário sem divergências de status*:

- **Visão geral:** cartões No acervo / Disponíveis / Emprestados / Perdidos (clicar abre o Gerenciar já filtrado).
- **Situação do acervo:** barras com porcentagem **e** número em texto.
- **Precisa de atenção:** livros perdidos, com a última localização, "Ver ficha" e "Editar".
- **Acervo por categoria:** itens e perdidos em cada categoria.
- **Atividade recente da equipe:** quem cadastrou, editou, mudou status, removeu, importou ou exportou (`activity.js`,
  guarda os 200 últimos registros).
- **Atalhos:** + Novo livro, Conferir perdidos, Exportar inventário (JSON).
- **Contas e perfis (só a bibliotecária):** promover um leitor a auxiliar (ou o contrário) e remover contas
  cadastradas. As contas fixas (Silvia e Thiago) ficam travadas.

## Requisitos do briefing → onde estão atendidos

### Objetivos do negócio

| Objetivo | Como o sistema atende | Onde |
|---|---|---|
| Digitalizar todo o acervo em um catálogo único | Cadastro rápido (campos agrupados, *Salvar e adicionar outro* que mantém estante e categoria), importação em lote por JSON | Gerenciar · `forms.js`, `storage.importarJSON` |
| Leitor consulta localização e disponibilidade | Busca grande no Início com resultados ao vivo já mostrando "Estante 12, prateleira B" e o status; ficha com a localização em destaque | Início/Catálogo · `render.js` |
| Manter o status correto, incluindo perdidos | Três status; "Marcar como perdido" em um clique (+ confirmação); select de status em cada linha; livro perdido aparece apagado e com aviso gentil | Gerenciar · `catalog.marcarComoPerdido` |
| Retirar do catálogo o que deixa a coleção | "Remover" com confirmação em bordô; a exclusão é definitiva e o livro some de todas as telas na hora | `catalog.excluir` |

### CRUD

| Operação | O que faz na BookHaven | Função principal |
|---|---|---|
| **Criar** | Adiciona livros ou outros materiais (revista, DVD, mapa…) | `catalog.criar` |
| **Ler** | Informa livros disponíveis, localização e disponibilidade | `catalog.buscarPorTexto`, `filtrar`, `ordenar`, `buscarPorId` |
| **Atualizar** | Edita todos os dados, troca o status, marca como perdido | `catalog.atualizar`, `alterarStatus`, `marcarComoPerdido` |
| **Excluir** | Remove livros que não fazem mais parte da coleção | `catalog.excluir` |

O passo a passo de cada operação, com arquivo e função, está em [`ESTUDO_DO_CODIGO.md`](ESTUDO_DO_CODIGO.md).

### Personas

| Persona | O que o sistema oferece |
|---|---|
| **Silvia** (bibliotecária) cataloga doações sem retrabalho | Formulário em grupos, Enter envia, foco automático no título, *Salvar e adicionar outro* repete estante/categoria |
| **Thiago** (auxiliar) confere estantes e marca perdidos | Botão "Marcar como perdido" na própria linha da tabela e select de status; contadores atualizados na hora |
| **Seu João** (67 anos) precisa de letras grandes e caminho claro até a estante | A+/A− até 28 px, alto contraste, busca enorme, localização em fonte grande: "Encontramos seu livro: Estante 12, prateleira B" |

### Restrições

| Restrição | Resposta |
|---|---|
| Orçamento quase nulo | Sem servidor, sem licença, sem dependência: gratuito |
| Computadores antigos | ~120 KB de código; listas paginadas; sem bibliotecas; CSS simples |
| Internet instável | Funciona totalmente offline; fontes com reserva e carregamento sem bloqueio |

### Métricas de sucesso

| Métrica | O que o sistema fornece | Observação honesta |
|---|---|---|
| 100 % do acervo catalogado | Contador "No acervo", cadastro ágil e importação em lote | A meta é operacional; o sistema dá as ferramentas e o contador para acompanhá-la |
| Leitor localiza um livro em < 2 minutos | A busca é o elemento mais destacado da primeira tela; o resultado já traz a localização; ficha a 1 clique | **Não foi cronometrado com leitores reais.** Sugestão: teste de usabilidade com 3 a 5 leitores |
| Inventário anual sem divergências de status | Status único por exemplar, perdidos sempre sinalizados, resumo (total/disponíveis/emprestados/perdidos), exportação JSON como registro do inventário | — |

---

## Como foi verificado

- **Lógica:** `tests/teste-logica.mjs` (109 verificações, incluindo login, cadastro, permissões, contas e painel).
- **Interface, em um Chrome real (controlado por protocolo de depuração):** busca, filtros,
  ordenação, ficha, criar, editar, status na linha, marcar como perdido, remover, recarregar a
  página e conferir persistência, exportar/importar/restaurar, teclado (Tab, Enter, Esc),
  A+/A− e preferência salva, `prefers-reduced-motion`, 3 000 livros, fontes bloqueadas
  (simulando offline) e **larguras de 320, 375, 768, 1024 e 1440 px** sem rolagem horizontal.
  Esses scripts de navegador não fazem parte do repositório.
- Durante os testes foram encontrados e corrigidos, entre outros: menu que estourava a tela com a
  letra no tamanho máximo, cartões de resumo que não encolhiam, atalho de teclado que mudava a
  tela por engano, e a ausência de aviso quando o navegador não consegue gravar.

## Limitações conhecidas (e próximos passos)

1. **Capacidade do `localStorage`.** Cada livro ocupa ≈ 300 bytes. O limite típico de 5 MB comporta
   **cerca de 17 mil livros**; o acervo real (~35 mil) ocuparia ≈ 10 MB. O sistema **avisa** quando
   não consegue gravar, mas para o acervo completo o caminho é trocar `storage.js` por
   **IndexedDB** (só esse arquivo muda, graças à separação em camadas).
2. **Sem servidor.** Cada computador tem o seu próprio acervo. Não há sincronização;
   "Exportar/Importar JSON" é o mecanismo de backup e de transferência.
   **Login e cadastro são simulados:** as senhas mockadas estão em `js/data/users.js` e as das contas novas
   ficam em texto puro no `localStorage`, visíveis a quem abrir o DevTools. Serve para demonstrar perfis e
   permissões, **não oferece segurança real**. Em produção, um servidor guardaria o hash da senha.
3. **ISBN:** valida o formato (10 ou 13 caracteres), mas não o dígito verificador.
4. **Cadastro de empréstimos:** o status *emprestado* é manual; não há leitor, prazo ou histórico
   (fora do escopo do briefing).
5. **Não testado:** leitores de tela reais (NVDA/VoiceOver), Safari e hardware antigo de verdade.
   Os ajustes de acessibilidade seguem as regras do WCAG, mas não substituem um teste com pessoas.
6. Cada tela tem o seu arquivo em `js/ui/` (inicio, catalogo, gerenciar, painel); o `main.js` só liga tudo.

## Visual (Figma)

O visual segue o PDF "BookHaven — Telas (Figma)": fundo verde-escuro, fichas de papel com sombra seca, carimbos de status, gavetas de assunto e cartões de livro coloridos. Está todo em `css/tema.css` (carregado por último; os tokens novos ficam em `css/variables.css`). Para voltar ao visual anterior, remova o `<link>` do `tema.css`. Logins de demonstração: `silvia/silvia123` (bibliotecária), `thiago/thiago123` (auxiliar), `joao/joao123` (leitor).

## Código sem comentários

Os arquivos do projeto não têm comentários (exigência do professor). O material de estudo está em `CODIGO_COMENTADO.md`: o mesmo código com comentários em português, arquivo por arquivo. Ele não faz parte do sistema.

## Como abrir

O sistema usa módulos ES (`import`/`export`), e o Chrome/Edge bloqueiam módulos quando a página é aberta direto do arquivo (`file://`). Três jeitos de abrir:

1. **Dar duplo clique em `ABRIR-BookHaven.bat`** (Windows): sobe um servidor local e abre o navegador (ou abre o Chrome liberando o arquivo local, se não houver Python).
2. Abrir o `index.html` no **Firefox**, que aceita módulos direto do arquivo.
3. Rodar `python -m http.server` na pasta e acessar `http://localhost:8000`.
