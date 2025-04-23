require('dotenv').config();
const fs = require('fs');
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const client = new WebClient(token);

async function getTeamId() {
  const { team } = await client.team.info();
  return team.id;
}

async function getArchivedChannels() {
  const archivedChannels = [];
  let cursor;

  do {
    const res = await client.conversations.list({
      limit: 1000,
      types: 'public_channel,private_channel',
      exclude_archived: false,
      cursor,
    });

    const archived = res.channels.filter(c => c.is_archived);
    archivedChannels.push(...archived);
    cursor = res.response_metadata?.next_cursor;

  } while (cursor);

  return archivedChannels;
}

(async () => {
  const teamId = await getTeamId();
  const archivedChannels = await getArchivedChannels();

  const urls = archivedChannels.map(c => ({
    name: c.name,
    id: c.id,
    url: `https://app.slack.com/client/${teamId}/${c.id}`,
  }));

  fs.writeFileSync('archived_channels.json', JSON.stringify(urls, null, 2));
  console.log(`✅ Saved ${urls.length} archived channels to archived_channels.json`);
})();