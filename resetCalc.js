// Cálculo de próximos horários de reset a partir de um config carregado dinamicamente.

function nextDailyReset(hourUTC = 8) {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    hourUTC, 0, 0
  ));
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

// weekday: 0=domingo, 1=segunda, 2=terça, 3=quarta...
function nextWeeklyReset(weekday = 2, hourUTC = 8, minuteUTC = 0) {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    hourUTC, minuteUTC, 0
  ));
  let diff = (weekday - next.getUTCDay() + 7) % 7;
  if (diff === 0 && next.getTime() <= now.getTime()) diff = 7;
  next.setUTCDate(next.getUTCDate() + diff);
  return next;
}

function unix(date) {
  return Math.floor(date.getTime() / 1000);
}

module.exports = { nextDailyReset, nextWeeklyReset, unix };
