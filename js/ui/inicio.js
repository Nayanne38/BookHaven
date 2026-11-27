import { buscarPorTexto, ordenar, listar, getResumo } from '../services/catalog.js';
import { usuarioAtual } from '../services/auth.js';
import {
  montarListaDeItens, montarResultadosBusca, montarChipsCategorias, montarAvisoRaras, montarCartoesResumo,
} from './render.js';
import { abrirCatalogoCom } from './catalogo.js';
import { debounce, porId } from '../utils/helpers.js';

const ESPERA_DIGITACAO_MS = 250;
const MAX_RESULTADOS_INICIO = 5;
const MAX_FAIXA = 8;

export const renderizarInicio = () => {
  const todos = listar();

  const contagens = {};
  todos.forEach((livro) => { contagens[livro.categoria] = (contagens[livro.categoria] ?? 0) + 1; });
  porId('chips').innerHTML = montarChipsCategorias(contagens);
  porId('saudacao-nome').textContent = usuarioAtual()?.nome ?? 'leitor';
  porId('resumo').innerHTML = montarCartoesResumo(getResumo());

  const novidades = todos.filter((livro) => !livro.obraRara && livro.status !== 'perdido');
  porId('faixa-novidades').innerHTML = montarListaDeItens(ordenar(novidades, 'criadoEm', 'desc').slice(0, MAX_FAIXA));
  porId('faixa-raras').innerHTML = montarListaDeItens(todos.filter((livro) => livro.obraRara)) + montarAvisoRaras();
};

const atualizarResultados = () => {
  const texto = porId('busca-inicio').value.trim();
  porId('resultados-inicio').hidden = texto === '';
  if (texto === '') return;
  porId('resultados-inicio').innerHTML = montarResultadosBusca(buscarPorTexto(texto), MAX_RESULTADOS_INICIO);
};

export const iniciarInicio = () => {
  porId('busca-inicio').addEventListener('input', debounce(atualizarResultados, ESPERA_DIGITACAO_MS));
  porId('form-busca-inicio').addEventListener('submit', (evento) => {
    evento.preventDefault();
    abrirCatalogoCom({ busca: porId('busca-inicio').value.trim() });
  });

  document.addEventListener('click', (evento) => {
    const alvo = evento.target;
    const gaveta = alvo.closest('[data-categoria]');
    if (gaveta) return abrirCatalogoCom({ categoria: gaveta.dataset.categoria });
    const cartao = alvo.closest('[data-filtro-status]');
    if (cartao) return abrirCatalogoCom({ status: cartao.dataset.filtroStatus });
    if (alvo.closest('[data-ver-todos]')) return abrirCatalogoCom({ busca: porId('busca-inicio').value.trim() });
  });
};
