require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { loadConfig, loadData, saveData } = require('./storage');
const { buildEmbed } = require('./embed');

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // recalcula a mensagem a cada 30 min

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

async function registerCommands() {
  const commands = [...client.commands.values()].map((c) => c.data.toJSON());
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log(`${commands.length} slash command(s) registrados.`);
}

async function updateMessage() {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  const config = loadConfig();
  const embed = buildEmbed(config);
  const data = loadData();

  if (data.messageId) {
    try {
      const msg = await channel.messages.fetch(data.messageId);
      await msg.edit({ embeds: [embed] });
      return;
    } catch {
      // mensagem foi apagada -> cria uma nova abaixo
    }
  }

  const msg = await channel.send({ embeds: [embed] });
  saveData({ messageId: msg.id });
}

client.once('ready', async () => {
  console.log(`Bot online como ${client.user.tag}`);
  await registerCommands();
  await updateMessage();
  setInterval(updateMessage, REFRESH_INTERVAL_MS);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { updateMessage });
  } catch (err) {
    console.error(err);
    const reply = { content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
