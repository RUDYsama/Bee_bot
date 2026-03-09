// ===== KEEP ALIVE (สำคัญสำหรับ Railway) =====
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

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
const TIMEOUT = 20 * 60 * 1000; // 20 นาที

let enabled = true;
let lastWebhookTime = Date.now();

// 🔍 DEBUG TOKEN
console.log("TOKEN EXISTS:", !!process.env.BOT_TOKEN);
console.log("TOKEN LENGTH:", process.env.BOT_TOKEN?.length);

// ===== BOT READY =====
client.on('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send("🔄 Bot มีการอัพเดท");
  } catch (err) {
    console.error("Startup message failed:", err);
  }
});

// ===== MESSAGE LISTENER =====
client.on('messageCreate', (msg) => {

  // คำสั่งเปิด/ปิด bot (เฉพาะเจ้าของ)
  if (!msg.webhookId && msg.author.id === USER_ID) {

    if (msg.content === "!bee off") {
      enabled = false;
      msg.reply("🐝 Bee bot หยุดทำงานแล้ว");
      return;
    }

    if (msg.content === "!bee on") {
      enabled = true;
      lastWebhookTime = Date.now();
      msg.reply("🐝 Bee bot กลับมาทำงานแล้ว");
      return;
    }

  }

  // ตรวจ webhook
  if (msg.channel.id !== CHANNEL_ID) return;

  if (msg.webhookId) {
    lastWebhookTime = Date.now();
    console.log("Webhook detected");
  }

});

// ===== WATCHDOG =====
setInterval(async () => {
  try {

    if (!enabled) return;

    const diff = Date.now() - lastWebhookTime;

    if (diff > TIMEOUT) {

      const channel = await client.channels.fetch(CHANNEL_ID);

      for (let i = 0; i < 3; i++) {
        await channel.send(`<@${USER_ID}> ดูเหมือนว่าตัวเกมจะหลุดนะ!!`);
        await new Promise(r => setTimeout(r, 5000));
      }

      lastWebhookTime = Date.now();
    }

  } catch (err) {
    console.error("Watchdog error:", err);
  }

}, 5*60 * 1000);

client.login(BOT_TOKEN);