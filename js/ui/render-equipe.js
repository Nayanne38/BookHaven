import { LISTA_STATUS, STATUS } from '../models/book.js';
import { escaparHtml, formatarLocalizacao } from '../utils/helpers.js';
import { ROTULO_STATUS } from './render.js';

const montarSelectStatusDaLinha = (livro) => `
  <select class="select select-status status-${escaparHtml(livro.status)}" data-status-id="${escaparHtml(livro.id)}"
          aria-label="Status de ${escaparHtml(livro.titulo)}">
    ${LISTA_STATUS.map(
      (status) => `<option value="${status}" ${status === livro.status ? 'selected' : ''}>${ROTULO_STATUS[status]}</option>`,
    ).join('')}
  </select>`;

const montarLinhaGerenciar = (livro, podeRemover) => {
  const id = escaparHtml(livro.id);
  const jaPerdido = livro.status === STATUS.PERDIDO;

  return `
    <tr>
      <td data-rotulo="Título">
        <strong>${escaparHtml(livro.titulo)}</strong>
        ${livro.obraRara ? '<span class="selo-raro">Rara</span>' : ''}
      </td>
      <td data-rotulo="Autor">${escaparHtml(livro.autor)}</td>
      <td data-rotulo="Categoria">${escaparHtml(livro.categoria)}</td>
      <td data-rotulo="Localização">${escaparHtml(formatarLocalizacao(livro))}</td>
      <td data-rotulo="Status">${montarSelectStatusDaLinha(livro)}</td>
      <td data-rotulo="Ações" class="celula-acoes">
        <button type="button" class="btn btn-primario btn-pequeno" data-editar-id="${id}">Editar</button>
        <button type="button" class="btn btn-perigo btn-pequeno" data-perdido-id="${id}" ${jaPerdido ? 'disabled title="Este livro já consta como perdido"' : ''}>Marcar como perdido</button>
        ${podeRemover ? `<button type="button" class="btn btn-perigo-contorno btn-pequeno" data-remover-id="${id}">Remover</button>` : ''}
      </td>
    </tr>`;
};

export const montarTabelaGerenciar = (livros, limite, podeRemover = true) => {
  if (livros.length === 0) {
    return `
      <div class="estado-vazio">
        <span class="icone" aria-hidden="true">🗂️</span>
        <h3>Nenhum livro encontrado</h3>
        <p>Não há livros com essa busca ou esse status. Que tal cadastrar um novo?</p>
        <button type="button" class="btn btn-secundario" data-limpar-gerenciar>Limpar busca e filtro</button>
      </div>`;
  }

  const visiveis = livros.slice(0, limite);
  const aviso =
    livros.length > visiveis.length
      ? `<p class="aviso-limite">Mostrando ${visiveis.length} de ${livros.length}. Use a busca para encontrar os demais.</p>`
      : '';

  return `
    <table class="tabela">
      <caption class="sr-only">Livros do acervo, do cadastro mais recente ao mais antigo</caption>
      <thead>
        <tr>
          <th scope="col">Título</th><th scope="col">Autor</th><th scope="col">Categoria</th>
          <th scope="col">Localização</th><th scope="col">Status</th><th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>${visiveis.map((livro) => montarLinhaGerenciar(livro, podeRemover)).join('')}</tbody>
    </table>
    ${aviso}`;
};

export const montarAreaUsuario = (usuario) =>
  usuario
    ? `<span class="usuario-nome"><strong>${escaparHtml(usuario.nome)}</strong>
         <span class="usuario-perfil">${escaparHtml(usuario.rotulo)}</span></span>
       <button type="button" class="btn btn-secundario btn-pequeno" data-sair>Sair</button>`
    : '';

const formatarDataHora = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const montarCartoesPainel = ({ resumo }) =>
  [
    { classe: 'resumo-total', numero: resumo.total, rotulo: 'No acervo', status: '' },
    { classe: 'resumo-disponivel', numero: resumo.disponiveis, rotulo: 'Disponíveis', status: STATUS.DISPONIVEL },
    { classe: 'resumo-emprestado', numero: resumo.emprestados, rotulo: 'Emprestados', status: STATUS.EMPRESTADO },
    { classe: 'resumo-perdido', numero: resumo.perdidos, rotulo: 'Perdidos', status: STATUS.PERDIDO },
  ]
    .map(
      (c) => `
        <button type="button" class="cartao-resumo ${c.classe}" data-gerenciar-status="${c.status}">
          <span class="resumo-numero">${c.numero}</span>
          <span class="resumo-rotulo">${c.rotulo}</span>
        </button>`,
    )
    .join('');

export const montarBarrasStatus = ({ resumo, percentuais }) =>
  [
    { classe: 'barra-disponivel', rotulo: 'Disponíveis', n: resumo.disponiveis, pct: percentuais.disponivel },
    { classe: 'barra-emprestado', rotulo: 'Emprestados', n: resumo.emprestados, pct: percentuais.emprestado },
    { classe: 'barra-perdido', rotulo: 'Perdidos', n: resumo.perdidos, pct: percentuais.perdido },
  ]
    .map(
      (b) => `
        <li>
          <span class="barra-rotulo">${b.rotulo}</span>
          <span class="barra" aria-hidden="true"><span class="barra-preench ${b.classe}" style="width:${b.pct}%"></span></span>
          <span class="barra-valor">${b.pct}% (${b.n})</span>
        </li>`,
    )
    .join('');

export const montarListaAtencao = (perdidos, limite = 6) => {
  if (perdidos.length === 0) {
    return '<li class="painel-vazio">Nenhum livro perdido no momento. Bom trabalho!</li>';
  }

  const itens = perdidos
    .slice(0, limite)
    .map((livro) => {
      const id = escaparHtml(livro.id);
      return `
        <li class="atencao-item">
          <div class="atencao-texto">
            <strong>${escaparHtml(livro.titulo)}</strong>
            <span>Última localização: ${escaparHtml(formatarLocalizacao(livro))}</span>
          </div>
          <div class="atencao-acoes">
            <button type="button" class="btn btn-secundario btn-pequeno" data-livro-id="${id}">Ver ficha</button>
            <button type="button" class="btn btn-secundario btn-pequeno" data-editar-id="${id}">Editar</button>
          </div>
        </li>`;
    })
    .join('');

  const resto = perdidos.length - limite;
  return itens + (resto > 0 ? `<li class="painel-vazio">…e mais ${resto}. Use "Conferir perdidos" para ver todos.</li>` : '');
};

export const montarTabelaCategorias = (linhas) => {
  if (linhas.length === 0) return '<p class="painel-vazio">O acervo ainda está vazio.</p>';
  return `
    <table class="tabela">
      <caption class="sr-only">Quantidade de itens e de perdidos em cada categoria</caption>
      <thead><tr><th scope="col">Categoria</th><th scope="col">Itens</th><th scope="col">Perdidos</th></tr></thead>
      <tbody>
        ${linhas
          .map(
            (l) => `<tr>
              <td data-rotulo="Categoria"><strong>${escaparHtml(l.categoria)}</strong></td>
              <td data-rotulo="Itens">${l.total}</td>
              <td data-rotulo="Perdidos">${l.perdidos}</td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>`;
};

export const montarAtividades = (lista) => {
  if (lista.length === 0) return '<li class="painel-vazio">Nenhuma atividade registrada ainda.</li>';
  return lista
    .map(
      (a) => `
        <li class="atividade-item">
          <time datetime="${escaparHtml(a.quando)}">${formatarDataHora(a.quando)}</time>
          <span><strong>${escaparHtml(a.usuario)}</strong> ${a.perfil ? `(${escaparHtml(a.perfil)})` : ''}
          ${escaparHtml(a.acao.toLowerCase())} ${escaparHtml(a.detalhe)}</span>
        </li>`,
    )
    .join('');
};

export const montarContas = (contas, idLogado) => `
  <table class="tabela">
    <caption class="sr-only">Contas do sistema e seus perfis</caption>
    <thead><tr><th scope="col">Nome</th><th scope="col">Usuário</th><th scope="col">Perfil</th><th scope="col">Ações</th></tr></thead>
    <tbody>
      ${contas
        .map((c) => {
          const id = escaparHtml(c.id);
          const perfil = c.fixa
            ? `${escaparHtml(c.rotulo)} <span class="ajuda">(conta fixa)</span>`
            : `<select class="select select-pequeno" data-conta-perfil="${id}" aria-label="Perfil de ${escaparHtml(c.nome)}">
                 <option value="leitor"${c.perfil === 'leitor' ? ' selected' : ''}>Leitor</option>
                 <option value="auxiliar"${c.perfil === 'auxiliar' ? ' selected' : ''}>Auxiliar</option>
               </select>`;
          const acao = c.fixa
            ? '—'
            : `<button type="button" class="btn btn-perigo btn-pequeno" data-conta-remover="${id}">Remover conta</button>`;
          return `<tr>
            <td data-rotulo="Nome"><strong>${escaparHtml(c.nome)}</strong>${c.id === idLogado ? ' <span class="ajuda">(você)</span>' : ''}</td>
            <td data-rotulo="Usuário">${id}</td>
            <td data-rotulo="Perfil">${perfil}</td>
            <td class="celula-acoes" data-rotulo="Ações">${acao}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>`;
