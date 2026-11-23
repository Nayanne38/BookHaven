export const abrirModal = (dialog) => dialog.showModal();

export const fecharModal = (dialog) => dialog.close();

export const iniciarModais = () => {
  document.addEventListener('click', (evento) => {
    const botaoFechar = evento.target.closest('[data-fechar-modal]');
    if (botaoFechar) {
      botaoFechar.closest('dialog').close();
      return;
    }
    const clicouNoFundo = evento.target instanceof HTMLDialogElement;
    if (clicouNoFundo && !('naoFecharNoFundo' in evento.target.dataset)) {
      evento.target.close();
    }
  });
};

export const confirmar = ({ titulo, mensagem, textoConfirmar = 'Confirmar', perigo = true }) =>
  new Promise((resolve) => {
    const dialog = document.getElementById('modal-confirmar');

    dialog.querySelector('#confirmar-titulo').textContent = titulo;
    dialog.querySelector('#confirmar-mensagem').textContent = mensagem;

    const botaoSim = dialog.querySelector('[data-confirmar-sim]');
    botaoSim.textContent = textoConfirmar;
    botaoSim.className = perigo ? 'btn btn-perigo' : 'btn btn-primario';
    dialog.classList.toggle('modal-perigo', perigo);

    dialog.returnValue = '';
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'sim'), { once: true });
    dialog.showModal();
  });
