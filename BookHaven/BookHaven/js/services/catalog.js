import { criarLivro, ErroValidacao, STATUS } from '../models/book.js';
import { carregarLivros, salvarLivros, restaurarSeed, exportarJSON, importarJSON, gravacaoFuncionou } from './storage.js';
import { normalizarTexto } from '../utils/helpers.js';

let livros = null;

const obterLivros = () => {
  if (livros === null) livros = carregarLivros();
  return livros;
};

const persistir = (novaLista) => {
  livros = novaLista;
  salvarLivros(livros);
};

export const salvamentoOk = () => gravacaoFuncionou();

export const listar = () => [...obterLivros()];

export const buscarPorId = (id) => obterLivros().find((livro) => livro.id === id) ?? null;

const MIN_DIGITOS_ISBN = 4;

export const buscarPorTexto = (texto, lista = obterLivros()) => {
  const palavras = normalizarTexto(texto).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return [...lista];

  return lista.filter((livro) => {
    const titulo = normalizarTexto(livro.titulo);
    const autor = normalizarTexto(livro.autor);
    const isbn = livro.isbn.toLowerCase();

    return palavras.every((palavra) => {
      if (titulo.includes(palavra) || autor.includes(palavra)) return true;

      const digitos = palavra.replace(/-/g, '');
      return digitos.length >= MIN_DIGITOS_ISBN && isbn.includes(digitos);
    });
  });
};

export const filtrar = (lista, { categoria = '', status = '' } = {}) =>
  lista.filter((livro) => {
    const categoriaOk = !categoria || livro.categoria === categoria;
    const statusOk = !status || livro.status === status;
    return categoriaOk && statusOk;
  });

export const ordenar = (lista, campo = 'titulo', direcao = 'asc') => {
  const sinal = direcao === 'desc' ? -1 : 1;

  const comparar = (a, b) => {
    if (campo === 'ano') {
      if (a.ano === null && b.ano === null) return 0;
      if (a.ano === null) return 1;
      if (b.ano === null) return -1;
      return (a.ano - b.ano) * sinal;
    }
    return String(a[campo]).localeCompare(String(b[campo]), 'pt-BR', { sensitivity: 'base' }) * sinal;
  };

  return [...lista].sort(comparar);
};

export const getResumo = () =>
  obterLivros().reduce(
    (resumo, livro) => {
      resumo.total += 1;
      if (livro.status === STATUS.DISPONIVEL) resumo.disponiveis += 1;
      if (livro.status === STATUS.EMPRESTADO) resumo.emprestados += 1;
      if (livro.status === STATUS.PERDIDO) resumo.perdidos += 1;
      return resumo;
    },
    { total: 0, disponiveis: 0, emprestados: 0, perdidos: 0 },
  );

export const getIndicadores = () => {
  const livros = obterLivros();
  const resumo = getResumo();
  const percentual = (parte) => (resumo.total === 0 ? 0 : Math.round((parte / resumo.total) * 100));

  const porCategoria = new Map();
  livros.forEach((livro) => {
    const linha = porCategoria.get(livro.categoria) ?? { categoria: livro.categoria, total: 0, perdidos: 0 };
    linha.total += 1;
    if (livro.status === STATUS.PERDIDO) linha.perdidos += 1;
    porCategoria.set(livro.categoria, linha);
  });

  return {
    resumo,
    percentuais: {
      disponivel: percentual(resumo.disponiveis),
      emprestado: percentual(resumo.emprestados),
      perdido: percentual(resumo.perdidos),
    },
    porCategoria: [...porCategoria.values()].sort(
      (a, b) => b.total - a.total || a.categoria.localeCompare(b.categoria, 'pt-BR'),
    ),
    perdidos: ordenar(livros.filter((livro) => livro.status === STATUS.PERDIDO), 'titulo'),
    raras: livros.filter((livro) => livro.obraRara).length,
  };
};

const garantirIsbnUnico = (isbn, idIgnorado = null) => {
  if (!isbn) return;
  const repetido = obterLivros().find((livro) => livro.isbn === isbn && livro.id !== idIgnorado);
  if (repetido) {
    throw new ErroValidacao({ isbn: `Este ISBN já existe no acervo: "${repetido.titulo}". Confira se não é o mesmo livro.` });
  }
};

export const criar = (dados) => {
  const livro = criarLivro({ ...dados, id: undefined, criadoEm: undefined });
  garantirIsbnUnico(livro.isbn);
  persistir([...obterLivros(), livro]);
  return livro;
};

export const atualizar = (id, alteracoes) => {
  const atual = buscarPorId(id);
  if (!atual) throw new Error('Livro não encontrado.');

  const atualizado = criarLivro({ ...atual, ...alteracoes, id: atual.id, criadoEm: atual.criadoEm });
  garantirIsbnUnico(atualizado.isbn, atual.id);

  persistir(obterLivros().map((livro) => (livro.id === id ? atualizado : livro)));
  return atualizado;
};

export const alterarStatus = (id, novoStatus) => atualizar(id, { status: novoStatus });

export const marcarComoPerdido = (id) => alterarStatus(id, STATUS.PERDIDO);

export const excluir = (id) => {
  const removido = buscarPorId(id);
  if (!removido) throw new Error('Livro não encontrado.');

  persistir(obterLivros().filter((livro) => livro.id !== id));
  return removido;
};

export const restaurarAcervoDeExemplo = () => {
  restaurarSeed();
  livros = null;
};

export const exportarAcervo = () => exportarJSON();

export const importarAcervo = (textoJson) => {
  const resultado = importarJSON(textoJson);
  if (resultado.ok) livros = null;
  return resultado;
};
