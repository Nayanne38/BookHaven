const TELAS = ['inicio', 'catalogo', 'painel', 'gerenciar', 'entrar', 'cadastro'];
const TELAS_LIVRES = ['entrar', 'cadastro'];
const TELA_PADRAO = 'inicio';
const TELA_DE_LOGIN = 'entrar';

const TITULOS = {
  inicio: 'Início',
  catalogo: 'Catálogo',
  painel: 'Painel',
  gerenciar: 'Gerenciar',
  entrar: 'Entrar',
  cadastro: 'Criar conta',
};

let guarda = () => true;

let destino = null;

export const definirGuarda = (funcao) => {
  guarda = funcao;
};
export const destinoPendente = () => destino;
export const limparDestino = () => {
  destino = null;
};

const resolverTela = (pedida) => {
  if (TELAS_LIVRES.includes(pedida)) return pedida;
  const veredito = guarda(pedida);
  if (veredito === true) return pedida;
  if (veredito === TELA_DE_LOGIN) destino = pedida;
  return veredito;
};

const telaDoEndereco = () => {
  const nome = window.location.hash.replace('#', '');
  return TELAS.includes(nome) ? nome : TELA_PADRAO;
};

const mostrarTela = (nome, moverFoco) => {
  TELAS.forEach((id) => {
    document.getElementById(id)?.classList.toggle('ativa', id === nome);
  });

  document.querySelectorAll('.navegacao a').forEach((link) => {
    const ehAtual = link.getAttribute('href') === `#${nome}`;
    if (ehAtual) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  document.title = `${TITULOS[nome]} · BookHaven`;
  window.scrollTo({ top: 0 });

  if (moverFoco) {
    const titulo = document.querySelector(`#${nome} h1`);
    titulo?.setAttribute('tabindex', '-1');
    titulo?.focus({ preventScroll: true });
  }
};

const exibirTelaDoEndereco = (moverFoco) => {
  const pedida = telaDoEndereco();
  const real = resolverTela(pedida);

  if (real !== pedida) window.history.replaceState(null, '', `#${real}`);

  mostrarTela(real, moverFoco);
};

export const iniciarNavegacao = () => {
  window.addEventListener('hashchange', () => {
    if (TELAS.includes(window.location.hash.replace('#', ''))) exibirTelaDoEndereco(true);
  });
  exibirTelaDoEndereco(false);

  document.querySelector('.pular-conteudo')?.addEventListener('click', (evento) => {
    evento.preventDefault();
    document.getElementById('conteudo').focus();
  });
};

export const irParaTela = (nome) => {
  window.location.hash = `#${nome}`;
};
