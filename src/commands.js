import { DONO_NOME, DONO_CONTATO, REGRAS_TEXTO } from "./prompt.js";

const MENU_TEXTO = `🤖 *Menu de comandos*

/menu - Mostra todos os comandos
/ajuda - Exibe ajuda
/ping - Testa se o bot está ativo
/hora - Mostra a hora atual
/data - Mostra a data atual
/info - Informações do bot
/dono - Mostra o responsável pelo bot
/regras - Mostra as regras do atendimento
/suporte - Encaminha para o dono
/status - Status do bot`;

const AJUDA_TEXTO = `❓ *Ajuda*

Digite /menu para ver todos os comandos disponíveis.`;

function horaAtualBR() {
  return new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function dataAtualBR() {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// Mapa comando -> função que retorna o texto de resposta
const COMANDOS = {
  "/menu": () => MENU_TEXTO,
  "/ajuda": () => AJUDA_TEXTO,
  "/ping": () => "Pong! 🟢",
  "/hora": () => `🕒 Agora são ${horaAtualBR()}.`,
  "/data": () => `📅 Hoje é ${dataAtualBR()}.`,
  "/info": () =>
    `🤖 *Sobre este bot*\n\nAssistente virtual automático para atendimento via WhatsApp.\nResponsável: ${DONO_NOME}`,
  "/dono": () => `👤 ${DONO_NOME}\nWhatsApp: ${DONO_CONTATO}`,
  "/regras": () => REGRAS_TEXTO,
  "/suporte": () =>
    `📞 Encaminhando para o responsável.\n\nVocê pode falar diretamente com ${DONO_NOME}: ${DONO_CONTATO}`,
  "/status": () => "✅ Bot Online",
};

const SAUDACOES = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];

/**
 * Tenta tratar a mensagem como comando fixo ou saudação.
 * Retorna o texto de resposta, ou null se não reconheceu a mensagem.
 */
export function tratarComando(textoOriginal) {
  const texto = textoOriginal.trim().toLowerCase();

  if (COMANDOS[texto]) {
    return COMANDOS[texto]();
  }

  if (SAUDACOES.includes(texto)) {
    return "Olá! 😊 Como posso te ajudar hoje? Digite /menu para ver as opções.";
  }

  // Perguntas específicas do prompt original, tratadas de forma fixa
  if (texto.includes("quem é o dono") || texto.includes("quem e o dono")) {
    return `O responsável por este bot é ${DONO_NOME}. Contato: ${DONO_CONTATO}.`;
  }
  if (texto.includes("como entro em contato")) {
    return `Você pode falar diretamente com o responsável pelo número ${DONO_CONTATO}.`;
  }

  return null; // não reconheceu -> quem chamou usa a mensagem padrão
}
