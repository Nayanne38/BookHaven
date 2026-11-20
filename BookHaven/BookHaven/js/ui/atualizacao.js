import { pode } from '../services/auth.js';
import { salvamentoOk } from '../services/catalog.js';
import { mostrarToast } from './toast.js';

const desenhistas = [];

export const registrarTela = (funcaoDeDesenhar) => desenhistas.push(funcaoDeDesenhar);

export const atualizarTudo = () => desenhistas.forEach((desenhar) => desenhar());

export const aposMudanca = () => {
  atualizarTudo();
  if (!salvamentoOk()) {
    mostrarToast('Atenção: este navegador não conseguiu gravar. As mudanças valem só até fechar a página. Use "Exportar JSON" para guardar o acervo.', 'erro');
  }
};

export const exigir = (acao) => {
  if (pode(acao)) return true;
  mostrarToast('Seu perfil não tem permissão para esta ação. Peça ajuda à bibliotecária.', 'erro');
  return false;
};
