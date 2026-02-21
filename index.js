// ===== KEEP ALIVE (สำคัญสำหรับ Railway) =====
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ===== DISCORD BOT =====
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== CONFIG =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "1300853186990575617";
const USER_ID = "511921901677969408";
const TIMEOUT = 20 * 60 * 1000;

// 🔍 DEBUG TOKEN (ชั่วคราว)
console.log("TOKEN EXISTS:", !!process.env.BOT_TOKEN);
console.log("TOKEN LENGTH:", process.env.BOT_TOKEN?.length);

let lastWebhookTime = Date.now();

client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (msg) => {
  if (msg.channel.id !== CHANNEL_ID) return;

  if (msg.webhookId) {
    lastWebhookTime = Date.now();
    console.log("Webhook detected");
  }
});

// เช็คทุก 5 นาที
setInterval(async () => {
  const diff = Date.now() - lastWebhookTime;

  if (diff > TIMEOUT) {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(`<@${USER_ID}> ⚠️ Webhook หยุดเกิน 20 นาทีแล้ว!`);
    lastWebhookTime = Date.now();
  }
}, 5 * 60 * 1000);

client.login(BOT_TOKEN);