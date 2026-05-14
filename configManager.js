const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(__dirname, "config.json");

function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch (error) {
    console.error("Error reading config:", error);
    return {};
  }
}

function setChannel(guildId, channelId) {
  const config = getConfig();
  config[guildId] = channelId;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getChannel(guildId) {
  const config = getConfig();
  return config[guildId];
}

module.exports = { setChannel, getChannel };
