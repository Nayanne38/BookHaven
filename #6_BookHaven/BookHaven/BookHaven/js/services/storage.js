import { criarLivro, ErroValidacao } from '../models/book.js';
import { LIVROS_SEED } from '../data/seed.js';

const CHAVE_LIVROS = 'bookhaven:livros';
const CHAVE_BACKUP = 'bookhaven:livros:corrompido';
const VERSAO_ARQUIVO = 1;

let copiaEmMemoria = null;

let ultimaGravacaoOk = true;

export const gravacaoFuncionou = () => ultimaGravacaoOk;

const lerTexto = (chave) => {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
};

const gravarTexto = (chave, valor) => {
  try {
    localStorage.setItem(chave, valor);
    return true;
  } catch {
    return false;
  }
};

const livrosDoSeed = () => LIVROS_SEED.map((dados) => criarLivro(dados));

export const salvarLivros = (livros) => {
  copiaEmMemoria = livros;
  ultimaGravacaoOk = gravarTexto(CHAVE_LIVROS, JSON.stringify(livros));
  return ultimaGravacaoOk;
};

export const carregarLivros = () => {
  if (copiaEmMemoria) return copiaEmMemoria;

  const textoSalvo = lerTexto(CHAVE_LIVROS);

  if (textoSalvo === null) {
    const inicial = livrosDoSeed();
    salvarLivros(inicial);
    return inicial;
  }

  try {
    const lista = JSON.parse(textoSalvo);
    if (!Array.isArray(lista)) throw new Error('Formato inesperado');
    copiaEmMemoria = lista.map((dados) => criarLivro(dados));
    return copiaEmMemoria;
  } catch {
    gravarTexto(CHAVE_BACKUP, textoSalvo);
    const inicial = livrosDoSeed();
    salvarLivros(inicial);
    return inicial;
  }
};

export const restaurarSeed = () => {
  const inicial = livrosDoSeed();
  salvarLivros(inicial);
  return inicial;
};

export const exportarJSON = () =>
  JSON.stringify(
    {
      versao: VERSAO_ARQUIVO,
      exportadoEm: new Date().toISOString(),
      livros: carregarLivros(),
    },
    null,
    2,
  );

export const importarJSON = (textoJson) => {
  let conteudo;
  try {
    conteudo = JSON.parse(textoJson);
  } catch {
    return { ok: false, erro: 'Este arquivo não é um JSON válido.' };
  }

  const lista = Array.isArray(conteudo) ? conteudo : conteudo?.livros;
  if (!Array.isArray(lista)) {
    return { ok: false, erro: 'Não encontramos uma lista de livros neste arquivo.' };
  }
  if (lista.length === 0) {
    return { ok: false, erro: 'O arquivo não tem nenhum livro.' };
  }

  const livros = [];
  const idsVistos = new Set();
  const isbnsVistos = new Set();

  for (const [posicao, dados] of lista.entries()) {
    const numero = posicao + 1;
    try {
      const livro = criarLivro(dados);

      if (idsVistos.has(livro.id)) {
        return { ok: false, erro: `Livro ${numero}: o id "${livro.id}" aparece repetido.` };
      }
      if (livro.isbn && isbnsVistos.has(livro.isbn)) {
        return { ok: false, erro: `Livro ${numero}: o ISBN ${livro.isbn} aparece repetido.` };
      }
      idsVistos.add(livro.id);
      if (livro.isbn) isbnsVistos.add(livro.isbn);
      livros.push(livro);
    } catch (erro) {
      if (erro instanceof ErroValidacao) {
        return { ok: false, erro: `Livro ${numero} ("${dados?.titulo ?? 'sem título'}"): ${erro.message}` };
      }
      throw erro;
    }
  }

  salvarLivros(livros);
  return { ok: true, quantidade: livros.length };
};
