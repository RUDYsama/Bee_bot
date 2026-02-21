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
const TIMEOUT = 60 * 1000; // 1 นาที (เทสเร็ว)

// 🔍 DEBUG TOKEN
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

// 🔥 เช็คทุก 1 นาที (ลดดีเลย์)
setInterval(async () => {
  try {
    const diff = Date.now() - lastWebhookTime;

    if (diff > TIMEOUT) {
      const channel = await client.channels.fetch(CHANNEL_ID);

      // 🔔 ปิง 5 รอบ
      for (let i = 0; i < 5; i++) {
        await channel.send(`<@${USER_ID}> ⚠️ Webhook หยุดเกินเวลาที่กำหนดแล้ว!`);
        await new Promise(r => setTimeout(r, 2000));
      }

      lastWebhookTime = Date.now();
    }
  } catch (err) {
    console.error("Watchdog error:", err);
  }
}, 60 * 1000); // ← จาก 5 นาที → เหลือ 1 นาที

client.login(BOT_TOKEN);