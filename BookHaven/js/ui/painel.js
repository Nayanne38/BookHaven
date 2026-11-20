import { getIndicadores } from '../services/catalog.js';
import { usuarioAtual, pode, listarContas, alterarPerfilConta, removerConta } from '../services/auth.js';
import { registrarAtividade, listarAtividades } from '../services/activity.js';
import {
  montarCartoesPainel, montarBarrasStatus, montarListaAtencao,
  montarTabelaCategorias, montarAtividades, montarContas,
} from './render-equipe.js';
import { confirmar } from './modal.js';
import { mostrarToast } from './toast.js';
import { exigir, aposMudanca } from './atualizacao.js';
import { abrirFormulario, acaoExportar } from './acoes-livro.js';
import { abrirGerenciarCom } from './gerenciar.js';
import { porId } from '../utils/helpers.js';

export const renderizarPainel = () => {
  const usuario = usuarioAtual();
  if (!usuario || !pode('gerenciar')) return;

  const indicadores = getIndicadores();
  porId('painel-nome').textContent = usuario.nome;
  porId('painel-saudacao').textContent =
    `${usuario.rotulo}. Acompanhe o acervo, confira os perdidos e veja o que a equipe fez.`;
  porId('painel-resumo').innerHTML = montarCartoesPainel(indicadores);
  porId('painel-barras').innerHTML = montarBarrasStatus(indicadores);
  porId('painel-atencao').innerHTML = montarListaAtencao(indicadores.perdidos);
  porId('painel-categorias').innerHTML = montarTabelaCategorias(indicadores.porCategoria);
  porId('painel-atividade').innerHTML = montarAtividades(listarAtividades());

  const podeGerirContas = pode('gerirUsuarios');
  porId('painel-contas-bloco').hidden = !podeGerirContas;
  if (podeGerirContas) porId('painel-contas').innerHTML = montarContas(listarContas(), usuario.id);
};

const acaoAlterarPerfilConta = (id, perfil) => {
  if (!exigir('gerirUsuarios')) return;
  const resultado = alterarPerfilConta(id, perfil);
  if (!resultado.ok) {
    mostrarToast(resultado.erro, 'erro');
  } else {
    mostrarToast(`${resultado.conta.nome} agora é ${resultado.conta.rotulo.toLowerCase()}.`);
    registrarAtividade('Mudou o perfil da conta de', `${resultado.conta.nome} para ${resultado.conta.rotulo.toLowerCase()}`);
  }
  aposMudanca();
};

const acaoRemoverConta = async (id) => {
  if (!exigir('gerirUsuarios')) return;
  const conta = listarContas().find((c) => c.id === id);
  if (!conta) return;

  const confirmado = await confirmar({
    titulo: 'Remover esta conta?',
    mensagem: `A conta de ${conta.nome} (${conta.id}) será apagada e a pessoa não poderá mais entrar. Esta ação não pode ser desfeita.`,
    textoConfirmar: 'Sim, remover conta',
  });
  if (!confirmado) return;

  const resultado = removerConta(id);
  if (!resultado.ok) {
    mostrarToast(resultado.erro, 'erro');
  } else {
    mostrarToast(`A conta de ${conta.nome} foi removida.`);
    registrarAtividade('Removeu a conta de', conta.nome);
  }
  aposMudanca();
};

export const iniciarPainel = () => {
  document.addEventListener('click', (evento) => {
    const alvo = evento.target;
    if (alvo.closest('#painel-novo')) return abrirFormulario();
    if (alvo.closest('#painel-exportar')) return acaoExportar();
    if (alvo.closest('#painel-perdidos')) return abrirGerenciarCom('perdido');

    const cartao = alvo.closest('[data-gerenciar-status]');
    if (cartao) return abrirGerenciarCom(cartao.dataset.gerenciarStatus);
    const removerContaBotao = alvo.closest('[data-conta-remover]');
    if (removerContaBotao) acaoRemoverConta(removerContaBotao.dataset.contaRemover);
  });

  document.addEventListener('change', (evento) => {
    const select = evento.target.closest('[data-conta-perfil]');
    if (select) acaoAlterarPerfilConta(select.dataset.contaPerfil, select.value);
  });
};
