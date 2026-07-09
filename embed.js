const { EmbedBuilder } = require('discord.js');
const { nextDailyReset, nextWeeklyReset, unix } = require('./resetCalc');

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
        value: `<t:${unix(daily)}:F>\n<t:${unix(daily)}:R>`,
      },
      {
        name: '📆 Weekly Projects',
        value: `<t:${unix(weeklyProjects)}:F>\n<t:${unix(weeklyProjects)}:R>`,
      },
      {
        name: '🛒 Vendors',
        value: `<t:${unix(vendors)}:F>\n<t:${unix(vendors)}:R>`,
      },
      {
        name: '🏆 Club Challenges',
        value: `<t:${unix(clubChallenges)}:F>\n<t:${unix(clubChallenges)}:R>`,
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

  const footerBits = ['Horários em UTC'];
  if (config.lastResearchUpdate) {
    footerBits.push(`Última pesquisa: ${new Date(config.lastResearchUpdate).toLocaleString('pt-BR', { timeZone: 'UTC' })} UTC`);
  }
  embed.setFooter({ text: footerBits.join(' • ') });

  return embed;
}

module.exports = { buildEmbed };
