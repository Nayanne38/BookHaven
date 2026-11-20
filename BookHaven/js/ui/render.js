import { CATEGORIAS, LISTA_STATUS, STATUS } from '../models/book.js';
import { escaparHtml, formatarLocalizacao } from '../utils/helpers.js';

export const ROTULO_STATUS = {
  [STATUS.DISPONIVEL]: 'Disponível',
  [STATUS.EMPRESTADO]: 'Emprestado',
  [STATUS.PERDIDO]: 'Perdido',
};

export const ROTULO_TIPO = { livro: 'Livro', revista: 'Revista', dvd: 'DVD', mapa: 'Mapa', jornal: 'Jornal', outro: 'Outro' };

const ICONE_CATEGORIA = {
  'Romance': '❤️',
  'Clássicos brasileiros': '📜',
  'Clássicos universais': '🌍',
  'Infantil': '🧸',
  'Didático': '🎓',
  'Biografia': '👤',
  'Poesia': '✒️',
  'História e ensaios': '🏛️',
  'Cinema e artes': '🎬',
};

const CORES_CAPA = ['capa-verde', 'capa-verde-claro', 'capa-marrom'];

const classeDaCapa = (livro) => {
  if (livro.obraRara) return 'capa-dourado capa-rara';
  const posicao = Math.max(CATEGORIAS.indexOf(livro.categoria), 0);
  return CORES_CAPA[posicao % CORES_CAPA.length];
};

export const montarCapa = (livro, largura = '8rem') => {
  const apagada = livro.status === STATUS.PERDIDO ? 'capa-indisponivel' : '';
  return `
    <div class="capa ${classeDaCapa(livro)} ${apagada}" style="--capa-w: ${largura}" aria-hidden="true">
      <span class="capa-titulo">${escaparHtml(livro.titulo)}</span>
      <span class="capa-autor">${escaparHtml(livro.autor)}</span>
    </div>`;
};

export const montarBadgeStatus = (status) =>
  `<span class="badge badge-${escaparHtml(status)}">${escaparHtml(ROTULO_STATUS[status] ?? status)}</span>`;

const montarMarcas = (livro) => `
  <span class="marcas">
    ${montarBadgeStatus(livro.status)}
    ${livro.obraRara ? '<span class="selo-raro">Obra rara</span>' : ''}
  </span>`;

export const montarItemLivro = (livro, posicao = 0) => `
  <button type="button" class="item-livro ${classeDaCapa(livro)} ${livro.status === STATUS.PERDIDO ? 'capa-indisponivel' : ''}" data-livro-id="${escaparHtml(livro.id)}" style="--i: ${posicao}">
    <span class="item-titulo">${escaparHtml(livro.titulo)}</span>
    <span class="item-autor">${escaparHtml(livro.autor)}</span>
    <span class="item-meta">${escaparHtml(livro.categoria)}${livro.ano ? ` · ${escaparHtml(String(livro.ano))}` : ''}</span>
    ${montarMarcas(livro)}
  </button>`;

export const montarListaDeItens = (livros) => livros.map((livro, posicao) => montarItemLivro(livro, posicao)).join('');

const montarResultado = (livro, posicao) => `
  <button type="button" class="resultado-busca" data-livro-id="${escaparHtml(livro.id)}" style="--i: ${posicao}">
    ${montarCapa(livro, '4rem')}
    <span class="info">
      <span class="item-titulo">${escaparHtml(livro.titulo)}</span>
      <span class="item-autor">${escaparHtml(livro.autor)}</span>
      <span class="localizacao">${escaparHtml(formatarLocalizacao(livro))}</span>
      ${montarMarcas(livro)}
    </span>
  </button>`;

export const textoQuantidade = (quantidade) => `${quantidade} ${quantidade === 1 ? 'livro' : 'livros'}`;

export const montarResultadosBusca = (achados, limite) => {
  if (achados.length === 0) {
    return '<p class="resultados-info">Não encontramos nenhum livro com essas palavras. Tente o sobrenome do autor ou parte do título.</p>';
  }

  const visiveis = achados.slice(0, limite);
  const sobra = achados.length - visiveis.length;

  return `
    <p class="resultados-info">
      ${achados.length === 1 ? 'Encontramos 1 livro:' : `Encontramos ${achados.length} livros:`}
    </p>
    <div class="lista-resultados">${visiveis.map(montarResultado).join('')}</div>
    ${sobra > 0 ? `<button type="button" class="btn btn-secundario" data-ver-todos>Ver todos os ${achados.length} no Catálogo</button>` : ''}`;
};

export const montarChipsCategorias = (contagens = {}) =>
  CATEGORIAS.map(
    (categoria) => `
      <button type="button" class="chip" data-categoria="${escaparHtml(categoria)}">
        <span class="chip-etiqueta">${escaparHtml(categoria)}</span>
        <span class="chip-puxador" aria-hidden="true"></span>
        <span class="chip-contagem">${contagens[categoria] ?? 0} ${contagens[categoria] === 1 ? 'título' : 'títulos'}</span>
      </button>`,
  ).join('');

export const montarAvisoRaras = () => `
  <div class="aviso-raras">
    <h3>Leia com cuidado, aqui na sala.</h3>
    <p>Obras raras não saem da biblioteca. Peça ao atendente e use luvas de algodão.</p>
    <span class="carimbo carimbo-dourado">Consulta local</span>
  </div>`;

export const montarCartoesResumo = (resumo) => {
  const cartoes = [
    { classe: 'resumo-total', numero: resumo.total, rotulo: 'No acervo', status: '' },
    { classe: 'resumo-disponivel', numero: resumo.disponiveis, rotulo: 'Disponíveis', status: STATUS.DISPONIVEL },
    { classe: 'resumo-emprestado', numero: resumo.emprestados, rotulo: 'Emprestados', status: STATUS.EMPRESTADO },
    { classe: 'resumo-perdido', numero: resumo.perdidos, rotulo: 'Perdidos', status: STATUS.PERDIDO },
  ];

  return cartoes
    .map(
      (c) => `
        <button type="button" class="cartao-resumo ${c.classe}" data-filtro-status="${c.status}">
          <span class="resumo-numero">${c.numero}</span>
          <span class="resumo-rotulo">${c.rotulo}</span>
        </button>`,
    )
    .join('');
};

export const montarOpcoesCategoria = () =>
  ['<option value="">Todas as categorias</option>']
    .concat(CATEGORIAS.map((c) => `<option value="${escaparHtml(c)}">${escaparHtml(c)}</option>`))
    .join('');

export const montarOpcoesStatus = () =>
  ['<option value="">Todos os status</option>']
    .concat(LISTA_STATUS.map((s) => `<option value="${s}">${ROTULO_STATUS[s]}</option>`))
    .join('');

export const montarEstadoVazio = (acervoVazio) =>
  acervoVazio
    ? `<div class="estado-vazio">
         <span class="icone" aria-hidden="true">📚</span>
         <h3>Nenhum livro por aqui ainda…</h3>
         <p>As estantes estão vazias. Assim que a equipe cadastrar os primeiros livros, eles aparecerão aqui.</p>
       </div>`
    : `<div class="estado-vazio">
         <span class="icone" aria-hidden="true">🔍</span>
         <h3>Não encontramos livros com essa busca</h3>
         <p>Tente outras palavras ou retire algum filtro. Se precisar, a equipe no balcão ajuda você a procurar.</p>
         <button type="button" class="btn btn-primario" data-limpar-filtros>Limpar busca e filtros</button>
       </div>`;

const montarCaixaLocalizacao = (livro) => {
  const lugar = escaparHtml(formatarLocalizacao(livro));

  if (livro.status === STATUS.EMPRESTADO) {
    return `
      <div class="localizacao-destaque localizacao-emprestado">
        <p class="localizacao-rotulo">Este exemplar está emprestado no momento. Quando voltar, ele fica em:</p>
        <p class="localizacao-texto">${lugar}</p>
      </div>`;
  }

  if (livro.status === STATUS.PERDIDO) {
    return `
      <p class="aviso aviso-perdido">
        <strong>Este exemplar está indisponível.</strong>
        Ele não está na estante e consta como perdido. Sentimos muito! Fale com a equipe no balcão:
        podemos indicar outro livro parecido.
      </p>
      <div class="localizacao-destaque localizacao-perdido">
        <p class="localizacao-rotulo">Última localização conhecida:</p>
        <p class="localizacao-texto">${lugar}</p>
      </div>`;
  }

  return `
    <div class="localizacao-destaque">
      <p class="localizacao-rotulo">Encontramos seu livro:</p>
      <p class="localizacao-texto">${lugar}</p>
    </div>`;
};

const linhaDeDado = (rotulo, valor) =>
  valor ? `<dt>${rotulo}</dt><dd>${escaparHtml(valor)}</dd>` : '';

export const montarFicha = (livro) => `
  <article class="ficha">
    <div class="ficha-topo">
      ${montarCapa(livro, '9rem')}
      <div>
        <h2 class="ficha-titulo" id="ficha-titulo">${escaparHtml(livro.titulo)}</h2>
        <p class="ficha-autor">${escaparHtml(livro.autor)}</p>
        ${montarMarcas(livro)}
      </div>
    </div>

    ${montarCaixaLocalizacao(livro)}

    ${livro.obraRara ? '<p class="aviso aviso-rara"><strong>Obra rara.</strong> Peça ao atendente do balcão para consultá-la com cuidado.</p>' : ''}

    <dl class="ficha-dados">
      ${linhaDeDado('Ano', livro.ano ? String(livro.ano) : '')}
      ${linhaDeDado('Categoria', livro.categoria)}
      ${linhaDeDado('Tipo', ROTULO_TIPO[livro.tipoMaterial] ?? livro.tipoMaterial)}
      ${linhaDeDado('ISBN', livro.isbn)}
      ${linhaDeDado('Observações', livro.observacoes)}
    </dl>

    <div class="ficha-acoes">
      <button type="button" class="btn btn-primario" data-fechar-modal>Fechar</button>
    </div>
  </article>`;
