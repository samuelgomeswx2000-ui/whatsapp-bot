import "dotenv/config";
import baileysPkg from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import pino from "pino";
import { tratarComando } from "./commands.js";
import { MENSAGEM_BOAS_VINDAS, MENSAGEM_PADRAO } from "./prompt.js";

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileysPkg;

// Guarda quem já recebeu a mensagem de boas-vindas nesta execução,
// pra não mandar toda hora (evita ser "spam").
const jaCumprimentado = new Set();

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Escaneie o QR code abaixo com o WhatsApp:");
      qrcode.generate(qr, { small: true });

      // Alternativa em imagem, mais fácil de escanear direto do celular
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
      console.log("Ou abra este link no celular e escaneie a imagem:");
      console.log(qrImageUrl);
    }

    if (connection === "close") {
      const deveReconectar =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexão fechada.", deveReconectar ? "Reconectando..." : "Deslogado.");
      if (deveReconectar) iniciarBot();
    } else if (connection === "open") {
      console.log("✅ Bot conectado ao WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      if (jid?.endsWith("@g.us")) continue; // ignora grupos

      const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (!texto) continue;

      // Mensagem de boas-vindas no primeiro contato
      if (!jaCumprimentado.has(jid)) {
        jaCumprimentado.add(jid);
        await sock.sendMessage(jid, { text: MENSAGEM_BOAS_VINDAS });
      }

      const resposta = tratarComando(texto) ?? MENSAGEM_PADRAO;

      await sock.sendMessage(jid, { text: resposta });
    }
  });
}

iniciarBot();
