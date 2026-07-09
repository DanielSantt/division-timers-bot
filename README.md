# Division 2 Timers Bot

Bot Discord que mantém uma mensagem sempre atualizada com os reset timers do
The Division 2, usando timestamps dinâmicos do próprio Discord (`<t:...:R>`).

Além do padrão fixo, o bot tem um **comando de auto-atualização**: quando
alguém roda `/atualizar-timers`, o bot chama a API da Anthropic (com busca
web ativada) pra pesquisar os horários atuais e reescreve sozinho o arquivo
`config.json` — sem precisar editar código nem reiniciar o bot.

## Timers cobertos

| Timer | Tipo | Comando pra atualizar |
|---|---|---|
| Dailies | Calculado automaticamente | `/atualizar-timers` |
| Weekly Projects | Calculado automaticamente | `/atualizar-timers` |
| Vendors | Calculado automaticamente | `/atualizar-timers` |
| Club Challenges | Calculado automaticamente | `/atualizar-timers` |
| State of the Game | Texto livre (sem agenda fixa) | `/definir-sotg` ou `/atualizar-timers` |
| Weekly Maintenance | Texto livre (sem agenda fixa) | `/definir-manutencao` ou `/atualizar-timers` |

## Instalação

```bash
npm install
```

## Configuração

1. `cp .env.example .env` e preencha:
   - `DISCORD_TOKEN`: Developer Portal → Bot → Reset Token
   - `CLIENT_ID`: Developer Portal → General Information → Application ID
   - `GUILD_ID`: ID do seu servidor (ative o Modo Desenvolvedor no Discord →
     botão direito no servidor → Copiar ID)
   - `CHANNEL_ID`: ID do canal onde a mensagem fixa vai ficar
   - `ANTHROPIC_API_KEY`: chave da API em https://console.anthropic.com
     (necessária só para `/atualizar-timers`; os outros comandos funcionam
     sem ela)

2. Convide o bot pro servidor (Developer Portal → OAuth2 → URL Generator):
   - Scopes: `bot`, `applications.commands`
   - Permissões: `Send Messages`, `Embed Links`, `Read Message History`

Os slash commands são registrados **automaticamente toda vez que o bot liga** —
não precisa rodar nenhum comando separado.

## Rodando 24hs sem instalar nada no seu PC (Railway)

Veja a seção **"Hospedar 24hs (sem instalar nada localmente)"** mais abaixo
neste documento para o passo a passo completo.

## Rodando localmente (opcional, se quiser testar no seu PC antes)

```bash
npm start
```

Na primeira execução, o bot envia a mensagem de timers no canal configurado
e passa a editar essa mesma mensagem depois (ID salvo em `data.json`).

## Comandos disponíveis (todos exigem permissão "Gerenciar Servidor")

- **`/atualizar-timers`** — pesquisa na web (via API da Anthropic) os
  horários atuais de Dailies, Weekly Projects, Vendors e Club Challenges,
  além de checar se há State of the Game ou Weekly Maintenance anunciadas.
  Atualiza `config.json` automaticamente e edita a mensagem na hora.
  Campos que a IA não conseguir confirmar com uma fonte razoável ficam
  como estavam (o comando avisa o que mudou e o que não).

- **`/definir-manutencao texto:"..."`** — define manualmente o texto da
  Weekly Maintenance, sem gastar chamada de IA.

- **`/definir-sotg texto:"..."`** — define manualmente o texto da State of
  the Game, sem gastar chamada de IA.

## Ajustando os horários manualmente (sem usar /atualizar-timers)

Edite `config.json` diretamente. Os campos `weekday` seguem 0=domingo,
1=segunda, 2=terça, 3=quarta... e todas as horas/minutos são em UTC.
O bot lê esse arquivo a cada atualização de mensagem — não precisa reiniciar.

## Mantendo o bot rodando 24/7

```bash
npm install -g pm2
pm2 start index.js --name division-bot
pm2 save
```

## Hospedar 24hs (sem instalar nada localmente)

Caminho recomendado: **GitHub + Railway**. Você só usa o navegador, nada é
instalado no seu computador.

### Passo 1 — Colocar o código no GitHub

1. Crie uma conta em https://github.com (se não tiver).
2. Clique em **New repository** (botão verde, ou `+` no canto superior direito → New repository).
3. Dê um nome, ex: `division-timers-bot`. Deixe como **Private** (recomendado,
   já que o repositório vai ter a estrutura do seu bot). Não marque nenhuma
   opção de inicialização. Clique em **Create repository**.
4. Na tela do repositório vazio, clique em **uploading an existing file**.
5. Arraste **todos os arquivos e pastas do projeto, exceto `.env`**
   (o `.env` nunca deve subir pro GitHub — ele tem seus tokens secretos).
   Pode subir `.env.example` normalmente, esse é só um modelo.
6. Clique em **Commit changes**.

### Passo 2 — Criar conta no Railway e conectar o repositório

1. Acesse https://railway.com e clique em **Login** → entre com sua conta do
   GitHub (mais simples, já autoriza tudo de uma vez).
2. Você ganha um teste grátis de 30 dias com $5 de crédito, sem precisar de
   cartão pra começar. Depois disso, o plano Hobby custa $5/mês — mais que
   suficiente pra um bot simples como esse.
3. Clique em **New Project** → **Deploy from GitHub repo**.
4. Selecione o repositório `division-timers-bot` que você acabou de criar.
5. O Railway detecta sozinho que é um projeto Node.js e já tenta rodar
   `npm install` + `npm start` (definido no `package.json`).

### Passo 3 — Configurar as variáveis de ambiente

1. Dentro do projeto no Railway, clique no serviço criado (o card do seu bot).
2. Vá na aba **Variables**.
3. Adicione uma por uma (clique em **New Variable**), com os mesmos nomes do
   `.env.example`:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `CHANNEL_ID`
   - `ANTHROPIC_API_KEY`
4. Clique em **Deploy** (ou o Railway já reinicia sozinho ao salvar as
   variáveis).

### Passo 4 — Conferir se está rodando

1. Vá na aba **Deployments** → clique no deploy mais recente → **View Logs**.
2. Procure a linha `Bot online como ...` — se aparecer, está tudo certo.
3. Vá no seu servidor Discord: a mensagem de timers deve aparecer no canal
   configurado, e os comandos `/atualizar-timers`, `/definir-manutencao` e
   `/definir-sotg` já devem funcionar.

### Observações sobre o Railway

- Não precisa mexer em `Procfile`, Docker, nem nada disso — o `package.json`
  já diz pro Railway rodar `npm start`.
- Toda vez que você der `git push` (ou subir arquivo novo pelo GitHub) pro
  repositório, o Railway re-implanta automaticamente com o código novo.
- `config.json` e `data.json` guardam estado (horários atualizados, ID da
  mensagem fixa). Em um redeploy causado por mudança de código, esses
  arquivos voltam para a versão que está no GitHub — ou seja, se você rodar
  `/atualizar-timers` em produção, o resultado fica salvo *no servidor do
  Railway*, mas some se você reimplantar por cima. Se isso incomodar, dá pra
  evoluir depois para salvar esses dados em um banco (Railway oferece
  PostgreSQL grátis dentro do mesmo projeto) — me avisa se quiser isso.

## Observações importantes

- `/atualizar-timers` consome créditos da sua API key da Anthropic (poucos
  tokens por chamada, mas não é gratuito). Por isso ele só roda sob demanda,
  não automaticamente — só quem tem permissão de "Gerenciar Servidor" pode
  usar.
- A IA é instruída a nunca inventar horário: se não achar uma fonte razoável
  para algum campo, ela mantém `null` e o bot preserva o valor anterior.
- Vale conferir de vez em quando as notas retornadas pelo comando — elas
  dizem o que foi confirmado e o que ficou incerto.
