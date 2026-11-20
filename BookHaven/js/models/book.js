import { gerarId } from '../utils/helpers.js';

export const STATUS = Object.freeze({
  DISPONIVEL: 'disponivel',
  EMPRESTADO: 'emprestado',
  PERDIDO: 'perdido',
});
export const LISTA_STATUS = Object.freeze(Object.values(STATUS));

export const TIPOS_MATERIAL = Object.freeze(['livro', 'revista', 'dvd', 'mapa', 'jornal', 'outro']);

export const CATEGORIAS = Object.freeze([
  'Romance',
  'Clássicos brasileiros',
  'Clássicos universais',
  'Infantil',
  'Didático',
  'Biografia',
  'Poesia',
  'História e ensaios',
  'Cinema e artes',
]);

export class ErroValidacao extends Error {
  constructor(erros) {
    super(Object.values(erros).join(' '));
    this.name = 'ErroValidacao';
    this.erros = erros;
  }
}

const texto = (valor) => String(valor ?? '').trim();

const limparIsbn = (valor) => texto(valor).replace(/[\s-]/g, '').toUpperCase();

const lerAno = (valor) => (valor === null || valor === undefined || texto(valor) === '' ? null : Number(valor));

const limparDados = (dados) => ({
  id: texto(dados.id) || gerarId(),
  titulo: texto(dados.titulo),
  autor: texto(dados.autor),
  ano: lerAno(dados.ano),
  categoria: texto(dados.categoria),
  isbn: limparIsbn(dados.isbn),
  tipoMaterial: texto(dados.tipoMaterial).toLowerCase() || 'livro',
  estante: texto(dados.estante).toUpperCase(),
  prateleira: texto(dados.prateleira).toUpperCase(),
  status: texto(dados.status).toLowerCase() || STATUS.DISPONIVEL,
  obraRara: dados.obraRara === true,
  observacoes: texto(dados.observacoes),
  criadoEm: texto(dados.criadoEm) || new Date().toISOString(),
});

export const validarLivro = (livro) => {
  const erros = {};
  const anoMaximo = new Date().getFullYear() + 1;

  if (!livro.titulo) erros.titulo = 'Ops, faltou o título do livro.';
  if (!livro.autor) erros.autor = 'Ops, faltou o nome do autor.';

  if (!CATEGORIAS.includes(livro.categoria)) erros.categoria = 'Ops, escolha uma categoria da lista.';
  if (!TIPOS_MATERIAL.includes(livro.tipoMaterial)) erros.tipoMaterial = 'Ops, escolha o tipo de material.';
  if (!LISTA_STATUS.includes(livro.status)) erros.status = 'Ops, escolha um status: disponível, emprestado ou perdido.';

  if (!livro.estante) erros.estante = 'Ops, faltou a estante. Sem ela, o leitor não acha o livro.';
  if (!livro.prateleira) erros.prateleira = 'Ops, faltou a prateleira (por exemplo: B).';

  if (livro.ano !== null && (!Number.isInteger(livro.ano) || livro.ano < 1000 || livro.ano > anoMaximo)) {
    erros.ano = `Esse ano parece estranho. Use um ano entre 1000 e ${anoMaximo}.`;
  }

  if (livro.isbn && !/^(\d{9}[\dX]|\d{13})$/.test(livro.isbn)) {
    erros.isbn = 'O ISBN deve ter 10 ou 13 dígitos (hífens são aceitos).';
  }

  if (Number.isNaN(Date.parse(livro.criadoEm))) erros.criadoEm = 'Data de cadastro inválida.';

  return erros;
};

export const criarLivro = (dados) => {
  const livro = limparDados(dados ?? {});
  const erros = validarLivro(livro);

  if (Object.keys(erros).length > 0) {
    throw new ErroValidacao(erros);
  }
  return Object.freeze(livro);
};
