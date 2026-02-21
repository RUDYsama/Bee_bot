// ===== KEEP ALIVE (สำคัญสำหรับ Railway) =====
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

// ⚠️ สำคัญ: ต้อง bind 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
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

// 🔍 DEBUG TOKEN
console.log("TOKEN EXISTS:", !!process.env.BOT_TOKEN);
console.log("TOKEN LENGTH:", process.env.BOT_TOKEN?.length);

let lastWebhookTime = Date.now();

// ✅ READY + TEST MESSAGE
client.on('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send("✅ บอทออนไลน์และเข้าถึงห้องนี้ได้แล้ว");
    console.log("Test message sent");
  } catch (err) {
    console.error("Test send failed:", err);
  }
});

// 🔍 DEBUG ทุกข้อความ (ช่วยหา webhook)
client.on('messageCreate', (msg) => {
  console.log("MSG:", msg.author?.username, "webhook?", !!msg.webhookId);

  if (msg.channel.id !== CHANNEL_ID) return;

  if (msg.webhookId) {
    lastWebhookTime = Date.now();
    console.log("Webhook detected");
  }
});

// ⏱️ Watchdog
setInterval(async () => {
  try {
    const diff = Date.now() - lastWebhookTime;

    if (diff > TIMEOUT) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`<@${USER_ID}> ⚠️ Webhook หยุดเกิน 20 นาทีแล้ว!`);
      lastWebhookTime = Date.now();
    }
  } catch (err) {
    console.error("Watchdog error:", err);
  }
}, 5 * 60 * 1000);

client.login(BOT_TOKEN);