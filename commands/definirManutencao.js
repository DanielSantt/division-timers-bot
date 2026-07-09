const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadConfig, saveConfig } = require('../storage');

const data = new SlashCommandBuilder()
  .setName('definir-manutencao')
  .setDescription('Define manualmente o texto da próxima Weekly Maintenance')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((opt) =>
    opt.setName('texto')
      .setDescription('Ex: "Quinta 10/07, 09:00-12:00 UTC" ou "Sem manutenção anunciada"')
      .setRequired(true)
  );

async function execute(interaction, { updateMessage }) {
  const texto = interaction.options.getString('texto');
  const config = loadConfig();
  config.weeklyMaintenanceInfo = texto;
  saveConfig(config);
  await updateMessage();
  await interaction.reply({ content: `✅ Weekly Maintenance atualizada para: "${texto}"`, ephemeral: true });
}

module.exports = { data, execute };
