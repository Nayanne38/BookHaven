import { buscarPorTexto, filtrar, ordenar, getResumo } from '../services/catalog.js';
import { usuarioAtual, pode } from '../services/auth.js';
import { montarOpcoesStatus, textoQuantidade } from './render.js';
import { montarTabelaGerenciar } from './render-equipe.js';
import { irParaTela } from './navigation.js';
import { abrirFormulario, acaoMarcarPerdido, acaoRemover, acaoExportar, acaoRestaurar } from './acoes-livro.js';
import { debounce, porId } from '../utils/helpers.js';

const ESPERA_DIGITACAO_MS = 250;
const LIMITE_LINHAS = 50;

const estado = { busca: '', status: '' };

export const renderizarGerenciar = () => {
  const { total, disponiveis, emprestados, perdidos } = getResumo();
  porId('resumo-gerenciar').textContent =
    `${total} no acervo · ${disponiveis} disponíveis · ${emprestados} emprestados · ${perdidos} perdidos`;

  const encontrados = buscarPorTexto(estado.busca);
  const filtrados = filtrar(encontrados, { status: estado.status });
  const ordenados = ordenar(filtrados, 'criadoEm', 'desc');

  porId('importar').hidden = !pode('importar');
  porId('restaurar').hidden = !pode('restaurar');
  const usuario = usuarioAtual();
  porId('nota-perfil').textContent =
    usuario && !pode('remover')
      ? `Perfil ${usuario.rotulo}: você pode cadastrar, editar e marcar como perdido. Remover, importar e restaurar são com a bibliotecária.`
      : '';

  porId('contador-gerenciar').textContent = textoQuantidade(ordenados.length);
  porId('tabela-gerenciar').innerHTML = montarTabelaGerenciar(ordenados, LIMITE_LINHAS, pode('remover'));
};

export const abrirGerenciarCom = (status) => {
  Object.assign(estado, { busca: '', status });
  porId('busca-gerenciar').value = '';
  porId('filtro-status-gerenciar').value = status;
  irParaTela('gerenciar');
};

export const iniciarGerenciar = () => {
  porId('filtro-status-gerenciar').innerHTML = montarOpcoesStatus();

  porId('busca-gerenciar').addEventListener('input', debounce(() => {
    estado.busca = porId('busca-gerenciar').value.trim();
    renderizarGerenciar();
  }, ESPERA_DIGITACAO_MS));
  porId('filtro-status-gerenciar').addEventListener('change', (e) => {
    estado.status = e.target.value;
    renderizarGerenciar();
  });

  document.addEventListener('click', (evento) => {
    const alvo = evento.target;
    if (alvo.closest('#novo-livro')) return abrirFormulario();
    if (alvo.closest('#exportar')) return acaoExportar();
    if (alvo.closest('#importar')) return porId('arquivo-importar').click();
    if (alvo.closest('#restaurar')) return acaoRestaurar();

    const editar = alvo.closest('[data-editar-id]');
    if (editar) return abrirFormulario(editar.dataset.editarId);
    const perdido = alvo.closest('[data-perdido-id]');
    if (perdido) return acaoMarcarPerdido(perdido.dataset.perdidoId);
    const remover = alvo.closest('[data-remover-id]');
    if (remover) return acaoRemover(remover.dataset.removerId);

    if (alvo.closest('[data-limpar-gerenciar]')) {
      Object.assign(estado, { busca: '', status: '' });
      porId('busca-gerenciar').value = '';
      porId('filtro-status-gerenciar').value = '';
      renderizarGerenciar();
    }
  });
};
