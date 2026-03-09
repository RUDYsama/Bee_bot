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
const TIMEOUT = 20 * 60 * 1000;

let enabled = true;
let lastWebhookTime = Date.now();
let alertActive = false;

// ===== BOT READY =====
client.on('clientReady', async () => {

  console.log(`Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send("🔄 Bot มีการอัพเดท");
  } catch (err) {
    console.error(err);
  }

});

// ===== MESSAGE LISTENER =====
client.on('messageCreate', async (msg) => {

  if (msg.channel.id !== CHANNEL_ID) return;

  const text = msg.content.toLowerCase();

  // ===== OWNER COMMANDS =====
  if (!msg.webhookId && msg.author.id === USER_ID) {

    if (text === "!bee off") {

      enabled = false;
      alertActive = false;
      lastWebhookTime = Date.now();

      msg.reply("🐝 Bee bot หยุดทำงานแล้ว");
      return;
    }

    if (text === "!bee on") {

      enabled = true;
      alertActive = false;
      lastWebhookTime = Date.now();

      msg.reply("🐝 Bee bot กลับมาทำงานแล้ว");
      return;
    }

    if (text === "!bee status") {

      const diff = Math.floor((Date.now() - lastWebhookTime) / 60000);

      msg.reply(
        `🐝 Bee bot status\n` +
        `เปิดอยู่: ${enabled}\n` +
        `Webhook ล่าสุด: ${diff} นาทีที่แล้ว`
      );

      return;
    }

    if (text === "!bee command" || text.includes("ขอดูคำสั่ง")) {

      msg.reply(
`🐝 Bee Bot Commands

!bee on
เปิดระบบตรวจสอบ

!bee off
ปิดระบบตรวจสอบ

!bee status
ดูสถานะบอท

!bee command
ดูคำสั่งทั้งหมด

ระบบจะเตือนเมื่อ Webhook หายเกิน 20 นาที`
      );

      return;
    }

  }

  // ===== WEBHOOK DETECT =====
  if (msg.webhookId) {

    lastWebhookTime = Date.now();

    // reset การแจ้งเตือน
    alertActive = false;

    console.log("Webhook detected");

  }

});

// ===== WATCHDOG =====
setInterval(async () => {

  try {

    if (!enabled) return;

    const diff = Date.now() - lastWebhookTime;

    if (diff > TIMEOUT && !alertActive) {

      alertActive = true;

      const channel = await client.channels.fetch(CHANNEL_ID);

      for (let i = 0; i < 3; i++) {

        if (!enabled) break;

        await channel.send(`<@${USER_ID}> ดูเหมือนว่าตัวเกมจะหลุดนะ!!`);

        await new Promise(r => setTimeout(r, 5000));

      }

      // หลังปิงครบ 3 รอบแล้ว
      // จะไม่ปิงอีกจนกว่า webhook ใหม่จะมา
      console.log("Alert sent (3 times). Waiting for webhook...");

    }

  } catch (err) {

    console.error("Watchdog error:", err);

  }

}, 60 * 1000);

client.login(BOT_TOKEN);