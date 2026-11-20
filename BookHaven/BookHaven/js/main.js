import { iniciarNavegacao, definirGuarda } from './ui/navigation.js';
import { iniciarLogin, atualizarTelaEntrar } from './ui/login.js';
import { usuarioAtual, pode, podeAcessar } from './services/auth.js';
import { iniciarTamanhoFonte } from './ui/fontSize.js';
import { iniciarModais } from './ui/modal.js';
import { registrarTela, atualizarTudo } from './ui/atualizacao.js';
import { montarAreaUsuario } from './ui/render-equipe.js';
import { renderizarInicio, iniciarInicio } from './ui/inicio.js';
import { renderizarCatalogo, iniciarCatalogo } from './ui/catalogo.js';
import { renderizarGerenciar, iniciarGerenciar } from './ui/gerenciar.js';
import { renderizarPainel, iniciarPainel } from './ui/painel.js';
import { iniciarAcoesLivro } from './ui/acoes-livro.js';
import { iniciarFicha } from './ui/ficha.js';
import { porId } from './utils/helpers.js';

const renderizarSessao = () => {
  const logado = usuarioAtual() !== null;
  const equipe = pode('gerenciar');
  document.querySelectorAll('[data-so-logado]').forEach((a) => { a.hidden = !logado; });
  document.querySelectorAll('[data-so-visitante]').forEach((a) => { a.hidden = logado; });
  document.querySelectorAll('[data-so-equipe]').forEach((a) => { a.hidden = !equipe; });
  document.querySelectorAll('[data-so-leitor]').forEach((a) => { a.hidden = !(logado && !equipe); });
  porId('area-usuario').innerHTML = montarAreaUsuario(usuarioAtual());
  atualizarTelaEntrar();
};

const iniciar = () => {
  definirGuarda((nomeDaTela) => {
    if (podeAcessar(nomeDaTela)) return true;
    return usuarioAtual() ? 'catalogo' : 'entrar';
  });
  iniciarNavegacao();
  iniciarTamanhoFonte();
  iniciarModais();

  [iniciarInicio, iniciarCatalogo, iniciarGerenciar, iniciarPainel, iniciarAcoesLivro, iniciarFicha].forEach((f) => f());
  [renderizarSessao, renderizarPainel, renderizarInicio, renderizarCatalogo, renderizarGerenciar].forEach(registrarTela);

  atualizarTudo();
  iniciarLogin({ aoMudarSessao: atualizarTudo });
  window.addEventListener('hashchange', atualizarTudo);

  document.documentElement.dataset.js = 'ok';
};

iniciar();
