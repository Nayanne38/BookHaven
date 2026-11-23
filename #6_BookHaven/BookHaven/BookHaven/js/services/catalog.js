import { Livro, ErroValidacao } from '../models/book.js';
import { carregarLivros, salvarLivros, restaurarSeed, exportarJSON, importarJSON, gravacaoFuncionou } from './storage.js';
import { normalizarTexto } from '../utils/helpers.js';

const MIN_DIGITOS_ISBN = 4;

/**
 * O acervo da biblioteca. Guarda a lista de Livros (privada) e oferece as
 * operações do CRUD, além de busca, filtro, ordenação e indicadores.
 */
export class Catalogo {
  #livros = null;

  #obter() {
    if (this.#livros === null) this.#livros = carregarLivros();
    return this.#livros;
  }

  #persistir(novaLista) {
    this.#livros = novaLista;
    salvarLivros(this.#livros);
  }

  #garantirIsbnUnico(isbn, idIgnorado = null) {
    if (!isbn) return;
    const repetido = this.#obter().find((livro) => livro.isbn === isbn && livro.id !== idIgnorado);
    if (repetido) {
      throw new ErroValidacao({ isbn: `Este ISBN já existe no acervo: "${repetido.titulo}". Confira se não é o mesmo livro.` });
    }
  }

  salvamentoOk() {
    return gravacaoFuncionou();
  }

  // ---- Ler -----------------------------------------------------------

  listar() {
    return [...this.#obter()];
  }

  buscarPorId(id) {
    return this.#obter().find((livro) => livro.id === id) ?? null;
  }

  buscarPorTexto(textoBusca, lista = this.#obter()) {
    const palavras = normalizarTexto(textoBusca).split(/\s+/).filter(Boolean);
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
  }

  filtrar(lista, { categoria = '', status = '' } = {}) {
    return lista.filter((livro) => {
      const categoriaOk = !categoria || livro.categoria === categoria;
      const statusOk = !status || livro.status === status;
      return categoriaOk && statusOk;
    });
  }

  ordenar(lista, campo = 'titulo', direcao = 'asc') {
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
  }

  getResumo() {
    return this.#obter().reduce(
      (resumo, livro) => {
        resumo.total += 1;
        if (livro.disponivel) resumo.disponiveis += 1;
        if (livro.emprestado) resumo.emprestados += 1;
        if (livro.perdido) resumo.perdidos += 1;
        return resumo;
      },
      { total: 0, disponiveis: 0, emprestados: 0, perdidos: 0 },
    );
  }

  getIndicadores() {
    const livros = this.#obter();
    const resumo = this.getResumo();
    const percentual = (parte) => (resumo.total === 0 ? 0 : Math.round((parte / resumo.total) * 100));

    const porCategoria = new Map();
    livros.forEach((livro) => {
      const linha = porCategoria.get(livro.categoria) ?? { categoria: livro.categoria, total: 0, perdidos: 0 };
      linha.total += 1;
      if (livro.perdido) linha.perdidos += 1;
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
      perdidos: this.ordenar(livros.filter((livro) => livro.perdido), 'titulo'),
      raras: livros.filter((livro) => livro.obraRara).length,
    };
  }

  // ---- Criar, atualizar, excluir ----------------------------------------

  criar(dados) {
    const livro = Livro.criar({ ...dados, id: undefined, criadoEm: undefined });
    this.#garantirIsbnUnico(livro.isbn);
    this.#persistir([...this.#obter(), livro]);
    return livro;
  }

  atualizar(id, alteracoes) {
    const atual = this.buscarPorId(id);
    if (!atual) throw new Error('Livro não encontrado.');

    const atualizado = Livro.criar({ ...atual, ...alteracoes, id: atual.id, criadoEm: atual.criadoEm });
    this.#garantirIsbnUnico(atualizado.isbn, atual.id);

    this.#persistir(this.#obter().map((livro) => (livro.id === id ? atualizado : livro)));
    return atualizado;
  }

  alterarStatus(id, novoStatus) {
    return this.atualizar(id, { status: novoStatus });
  }

  marcarComoPerdido(id) {
    return this.alterarStatus(id, 'perdido');
  }

  excluir(id) {
    const removido = this.buscarPorId(id);
    if (!removido) throw new Error('Livro não encontrado.');

    this.#persistir(this.#obter().filter((livro) => livro.id !== id));
    return removido;
  }

  // ---- Backup -----------------------------------------------------------

  restaurarAcervoDeExemplo() {
    restaurarSeed();
    this.#livros = null;
  }

  exportarAcervo() {
    return exportarJSON();
  }

  importarAcervo(textoJson) {
    const resultado = importarJSON(textoJson);
    if (resultado.ok) this.#livros = null;
    return resultado;
  }
}

const catalogo = new Catalogo();

export const salvamentoOk = () => catalogo.salvamentoOk();
export const listar = () => catalogo.listar();
export const buscarPorId = (id) => catalogo.buscarPorId(id);
export const buscarPorTexto = (texto, lista) => catalogo.buscarPorTexto(texto, lista);
export const filtrar = (lista, opcoes) => catalogo.filtrar(lista, opcoes);
export const ordenar = (lista, campo, direcao) => catalogo.ordenar(lista, campo, direcao);
export const getResumo = () => catalogo.getResumo();
export const getIndicadores = () => catalogo.getIndicadores();
export const criar = (dados) => catalogo.criar(dados);
export const atualizar = (id, alteracoes) => catalogo.atualizar(id, alteracoes);
export const alterarStatus = (id, novoStatus) => catalogo.alterarStatus(id, novoStatus);
export const marcarComoPerdido = (id) => catalogo.marcarComoPerdido(id);
export const excluir = (id) => catalogo.excluir(id);
export const restaurarAcervoDeExemplo = () => catalogo.restaurarAcervoDeExemplo();
export const exportarAcervo = () => catalogo.exportarAcervo();
export const importarAcervo = (textoJson) => catalogo.importarAcervo(textoJson);
