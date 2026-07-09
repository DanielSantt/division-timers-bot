const SYSTEM_PROMPT = `Você pesquisa horários de reset do jogo "Tom Clancy's The Division 2" (Ubisoft).
Use a ferramenta de busca web para confirmar, com fontes atuais e confiáveis (notas oficiais da Ubisoft,
Steam, ou sites de referência da comunidade atualizados recentemente), os horários de:
1. Dailies (reset diário de projects/bounties)
2. Weekly Projects (reset semanal)
3. Vendors (reset semanal de vendedores)
4. Club Challenges (reset semanal dos desafios do Ubisoft Club)
5. Se há alguma "State of the Game" (livestream) agendada ou anunciada recentemente
6. Se há alguma Weekly Maintenance (janela de manutenção) agendada ou anunciada recentemente

Responda APENAS com um JSON válido, sem markdown, sem texto antes ou depois, no formato exato:
{
  "daily": { "hourUTC": number|null },
  "weeklyProjects": { "weekday": number|null, "hourUTC": number|null, "minuteUTC": number|null },
  "vendors": { "weekday": number|null, "hourUTC": number|null, "minuteUTC": number|null },
  "clubChallenges": { "weekday": number|null, "hourUTC": number|null, "minuteUTC": number|null },
  "stateOfTheGameInfo": string|null,
  "weeklyMaintenanceInfo": string|null,
  "notes": string
}

Regras:
- weekday: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado.
- Todos os horários em UTC.
- Use null em qualquer campo que você não conseguir confirmar com uma fonte razoavelmente confiável e atual
  (não invente números). Campos null serão ignorados e o valor atual será mantido.
- "notes": resuma em 1-3 frases, em português, o que foi confirmado, o que não foi encontrado, e cite
  brevemente a natureza das fontes usadas (sem precisar citar URLs completas).`;

async function researchResetTimes(apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Pesquise e responda com o JSON dos horários de reset do The Division 2.' },
      ],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API retornou ${response.status}: ${errText}`);
  }

  const data = await response.json();

  const text = data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Não consegui interpretar a resposta da IA como JSON. Resposta bruta:\n${text.slice(0, 500)}`);
  }

  return parsed;
}

module.exports = { researchResetTimes };
