const { EmbedBuilder } = require('discord.js');
const { nextDailyReset, nextWeeklyReset, unix } = require('./resetCalc');

// Formata o tempo restante como "4d 23h 12m" (ou "23h 12m" se for menos de 1 dia,
// ou "12m" se for menos de 1 hora).
function formatCountdown(targetDate) {
  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) return 'agora';

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return `em ${parts.join(' ')}`;
}

function buildEmbed(config) {
  const daily = nextDailyReset(config.daily.hourUTC);
  const weeklyProjects = nextWeeklyReset(
    config.weeklyProjects.weekday, config.weeklyProjects.hourUTC, config.weeklyProjects.minuteUTC
  );
  const vendors = nextWeeklyReset(
    config.vendors.weekday, config.vendors.hourUTC, config.vendors.minuteUTC
  );
  const clubChallenges = nextWeeklyReset(
    config.clubChallenges.weekday, config.clubChallenges.hourUTC, config.clubChallenges.minuteUTC
  );

  const embed = new EmbedBuilder()
    .setTitle('⏱️ The Division 2 — Reset Timers')
    .setColor(0xB22222)
    .addFields(
      {
        name: '📅 Dailies (Projects, Bounties)',
        value: `<t:${unix(daily)}:F>\n${formatCountdown(daily)}`,
      },
      {
        name: '📆 Weekly Projects',
        value: `<t:${unix(weeklyProjects)}:F>\n${formatCountdown(weeklyProjects)}`,
      },
      {
        name: '🛒 Vendors',
        value: `<t:${unix(vendors)}:F>\n${formatCountdown(vendors)}`,
      },
      {
        name: '🏆 Club Challenges',
        value: `<t:${unix(clubChallenges)}:F>\n${formatCountdown(clubChallenges)}`,
      },
      {
        name: '📺 State of the Game',
        value: config.stateOfTheGameInfo,
      },
      {
        name: '🛠️ Weekly Maintenance',
        value: config.weeklyMaintenanceInfo,
      }
    )
    .setTimestamp();

  const footerBits = ['Horários em UTC', 'contador atualizado a cada minuto'];
  if (config.lastResearchUpdate) {
    footerBits.push(`Última pesquisa: ${new Date(config.lastResearchUpdate).toLocaleString('pt-BR', { timeZone: 'UTC' })} UTC`);
  }
  embed.setFooter({ text: footerBits.join(' • ') });

  return embed;
}

module.exports = { buildEmbed };
