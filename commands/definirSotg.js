const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadConfig, saveConfig } = require('../storage');

const data = new SlashCommandBuilder()
  .setName('definir-sotg')
  .setDescription('Define manualmente o texto da próxima State of the Game')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((opt) =>
    opt.setName('texto')
      .setDescription('Ex: "Quarta 15/07, 17h CET" ou "Sem transmissão anunciada"')
      .setRequired(true)
  );

async function execute(interaction, { updateMessage }) {
  const texto = interaction.options.getString('texto');
  const config = loadConfig();
  config.stateOfTheGameInfo = texto;
  saveConfig(config);
  await updateMessage();
  await interaction.reply({ content: `✅ State of the Game atualizada para: "${texto}"`, ephemeral: true });
}

module.exports = { data, execute };
