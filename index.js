const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const USER_ID = process.env.USER_ID;

let lastWebhookTime = Date.now();
let enabled = true;
let alertRunning = false;

const CHECK_INTERVAL = 60000; // เช็คทุก 1 นาที
const TIMEOUT = 20 * 60 * 1000; // 20 นาที
const ALERT_REPEAT = 3;
const ALERT_DELAY = 5000;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel) {
    channel.send("🤖 Bot มีการอัพเดท");
  }

  startWatchdog();
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // อ่าน webhook
  if (message.webhookId) {
    lastWebhookTime = Date.now();
    return;
  }

  // ===== commands =====

  if (msg === "!bee on") {
    enabled = true;
    lastWebhookTime = Date.now();
    message.reply("🐝 Bee bot เริ่มทำงานแล้ว");
  }

  if (msg === "!bee off") {
    enabled = false;
    lastWebhookTime = Date.now();
    message.reply("🐝 Bee bot หยุดทำงานแล้ว");
  }

  if (msg === "!bee status") {
    message.reply(
      `🐝 Bee bot status: ${enabled ? "ทำงานอยู่" : "ปิดอยู่"}`
    );
  }

  if (msg === "!bee command" || msg.includes("ขอดูคำสั่ง")) {
    message.reply(`
🐝 Bee Bot Commands

!bee on
→ เปิดการตรวจสอบ

!bee off
→ ปิดการตรวจสอบ

!bee status
→ ดูสถานะบอท

!bee command
→ ดูคำสั่งทั้งหมด

ระบบจะเตือนเมื่อ Webhook หายเกิน 20 นาที
`);
  }

});

function startWatchdog() {

  setInterval(async () => {

    if (!enabled) return;

    const now = Date.now();
    const diff = now - lastWebhookTime;

    if (diff > TIMEOUT && !alertRunning) {

      alertRunning = true;

      const channel = client.channels.cache.get(CHANNEL_ID);

      if (!channel) {
        alertRunning = false;
        return;
      }

      for (let i = 0; i < ALERT_REPEAT; i++) {

        if (!enabled) break;

        await channel.send(
          `<@${USER_ID}> ดูเหมือนว่าตัวเกมจะหลุดนะ!!`
        );

        await new Promise(r => setTimeout(r, ALERT_DELAY));
      }

      alertRunning = false;

      lastWebhookTime = Date.now();
    }

  }, CHECK_INTERVAL);

}

client.login(TOKEN);