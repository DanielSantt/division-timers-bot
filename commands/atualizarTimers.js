const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadConfig, saveConfig } = require('../storage');
const { researchResetTimes } = require('../research');

const data = new SlashCommandBuilder()
  .setName('atualizar-timers')
  .setDescription('Pesquisa na web e atualiza os horários de reset do The Division 2 (usa a API da Anthropic)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

async function execute(interaction, { updateMessage }) {
  await interaction.deferReply();

  if (!process.env.ANTHROPIC_API_KEY) {
    await interaction.editReply('❌ `ANTHROPIC_API_KEY` não está configurada no `.env`. Sem ela não dá pra pesquisar automaticamente — mas você pode usar `/definir-manutencao` e `/definir-sotg` pra atualizar manualmente.');
    return;
  }

  try {
    const config = loadConfig();
    const result = await researchResetTimes(process.env.ANTHROPIC_API_KEY);

    const changes = [];

    function mergeIfPresent(key, label) {
      const incoming = result[key];
      if (!incoming) return;
      const current = config[key];
      const merged = { ...current };
      let changed = false;
      for (const field of ['weekday', 'hourUTC', 'minuteUTC']) {
        if (incoming[field] !== undefined && incoming[field] !== null && incoming[field] !== current[field]) {
          merged[field] = incoming[field];
          changed = true;
        }
      }
      if (changed) {
        config[key] = merged;
        changes.push(label);
      }
    }

    mergeIfPresent('daily', 'Dailies');
    mergeIfPresent('weeklyProjects', 'Weekly Projects');
    mergeIfPresent('vendors', 'Vendors');
    mergeIfPresent('clubChallenges', 'Club Challenges');

    if (result.stateOfTheGameInfo && result.stateOfTheGameInfo !== config.stateOfTheGameInfo) {
      config.stateOfTheGameInfo = result.stateOfTheGameInfo;
      changes.push('State of the Game');
    }
    if (result.weeklyMaintenanceInfo && result.weeklyMaintenanceInfo !== config.weeklyMaintenanceInfo) {
      config.weeklyMaintenanceInfo = result.weeklyMaintenanceInfo;
      changes.push('Weekly Maintenance');
    }

    config.lastResearchUpdate = new Date().toISOString();
    config.lastResearchNotes = result.notes || null;
    saveConfig(config);

    await updateMessage();

    const changeList = changes.length ? changes.map((c) => `• ${c}`).join('\n') : '_Nenhum campo mudou — os valores atuais já estavam corretos._';

    await interaction.editReply(
      `✅ Pesquisa concluída.\n\n**Campos atualizados:**\n${changeList}\n\n**Notas da pesquisa:**\n${result.notes || '—'}`
    );
  } catch (err) {
    console.error(err);
    await interaction.editReply(`❌ Erro ao pesquisar: ${err.message}`);
  }
}

module.exports = { data, execute };
