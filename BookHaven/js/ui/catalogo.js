import { buscarPorTexto, filtrar, ordenar, listar } from '../services/catalog.js';
import { montarListaDeItens, montarEstadoVazio, montarOpcoesCategoria, montarOpcoesStatus } from './render.js';
import { irParaTela } from './navigation.js';
import { debounce, porId } from '../utils/helpers.js';

const ESPERA_DIGITACAO_MS = 250;
const LIMITE_CATALOGO = 48;

const ESTADO_INICIAL = { busca: '', categoria: '', status: '', ordem: 'titulo-asc', limite: LIMITE_CATALOGO };
const estado = { ...ESTADO_INICIAL };

const aplicarOrdem = (lista, ordem) => {
  const [campo, direcao] = ordem.split('-');
  return ordenar(lista, campo, direcao);
};

const temFiltroAtivo = () => [estado.busca, estado.categoria, estado.status].some((valor) => valor !== '');

const sincronizarControles = () => {
  porId('busca-catalogo').value = estado.busca;
  porId('filtro-categoria').value = estado.categoria;
  porId('filtro-status').value = estado.status;
  porId('ordem').value = estado.ordem;
};

export const renderizarCatalogo = () => {
  const encontrados = buscarPorTexto(estado.busca);
  const filtrados = filtrar(encontrados, { categoria: estado.categoria, status: estado.status });
  const ordenados = aplicarOrdem(filtrados, estado.ordem);

  const visiveis = ordenados.slice(0, estado.limite);
  const faltam = ordenados.length - visiveis.length;

  porId('contador').textContent =
    faltam > 0
      ? `Mostrando ${visiveis.length} de ${ordenados.length} livros`
      : ordenados.length === 1 ? '1 livro encontrado' : `${ordenados.length} livros encontrados`;
  porId('limpar-filtros').hidden = !temFiltroAtivo();
  porId('mostrar-mais').hidden = faltam <= 0;

  const grade = porId('grade-livros');
  grade.innerHTML = ordenados.length > 0 ? montarListaDeItens(visiveis) : montarEstadoVazio(listar().length === 0);
  grade.classList.toggle('grade-capas', ordenados.length > 0);
};

const redesenharDoComeco = () => {
  estado.limite = LIMITE_CATALOGO;
  renderizarCatalogo();
};

export const abrirCatalogoCom = (filtros) => {
  Object.assign(estado, ESTADO_INICIAL, filtros);
  sincronizarControles();
  renderizarCatalogo();
  irParaTela('catalogo');
};

export const iniciarCatalogo = () => {
  porId('filtro-categoria').innerHTML = montarOpcoesCategoria();
  porId('filtro-status').innerHTML = montarOpcoesStatus();

  porId('busca-catalogo').addEventListener('input', debounce(() => {
    estado.busca = porId('busca-catalogo').value.trim();
    redesenharDoComeco();
  }, ESPERA_DIGITACAO_MS));
  porId('filtro-categoria').addEventListener('change', (e) => { estado.categoria = e.target.value; redesenharDoComeco(); });
  porId('filtro-status').addEventListener('change', (e) => { estado.status = e.target.value; redesenharDoComeco(); });
  porId('ordem').addEventListener('change', (e) => { estado.ordem = e.target.value; redesenharDoComeco(); });

  document.addEventListener('click', (evento) => {
    if (evento.target.closest('#mostrar-mais')) {
      estado.limite += LIMITE_CATALOGO;
      renderizarCatalogo();
    }
    if (evento.target.closest('#limpar-filtros') || evento.target.closest('[data-limpar-filtros]')) abrirCatalogoCom({});
  });
};
