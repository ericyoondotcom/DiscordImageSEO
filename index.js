require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const { processImage } = require("./imageProcessor");
const { setChannel, getChannel } = require("./configManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const commands = [
  new SlashCommandBuilder()
    .setName("setocr")
    .setDescription("Set the channel where OCR results will be sent")
    .addChannelOption(option => 
      option.setName("channel")
        .setDescription("The channel to send OCR results to")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Successfully registered slash commands.");
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "setocr") {
    const channel = interaction.options.getChannel("channel");
    setChannel(interaction.guildId, channel.id);
    await interaction.reply({ 
      content: `OCR results will now be sent to <#${channel.id}>`, 
      ephemeral: true 
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const targetChannelId = getChannel(message.guild.id);
  if (!targetChannelId) return;

  const targetChannel = await message.guild.channels.fetch(targetChannelId).catch(() => null);
  if (!targetChannel) return;

  const imageAttachments = message.attachments.filter((att) =>
    att.contentType?.startsWith("image/") && !att.spoiler
  );

  if (imageAttachments.size === 0) return;

  for (const [id, attachment] of imageAttachments) {
    try {
      const result = await processImage(attachment.url, attachment.contentType);
      if (!result) continue;

      let replyText = `**Description:** ${result.description}`;
      if (result.ocr) {
        const flattenedOcr = result.ocr.replace(/\n+/g, " ").trim();
        replyText += `\n**OCR:** ${flattenedOcr}`;
      }
      replyText += `\n**Link:** ${message.url}`;
      
      const formattedMessage = replyText.split("\n").map(line => `-# ${line}`).join("\n") + `\n${attachment.proxyURL}`;
      await targetChannel.send(formattedMessage);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
