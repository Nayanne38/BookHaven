const DURACAO_MS = 3500;

const obterArea = () => {
  let area = document.querySelector('.toast-area');
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    document.body.append(area);
  }
  return area;
};

export const mostrarToast = (mensagem, tipo = 'sucesso') => {
  const toast = document.createElement('div');
  toast.className = tipo === 'erro' ? 'toast toast-erro' : 'toast';
  toast.textContent = mensagem;

  obterArea().append(toast);

  setTimeout(() => {
    toast.classList.add('toast-saindo');
    setTimeout(() => toast.remove(), 300);
  }, DURACAO_MS);
};
