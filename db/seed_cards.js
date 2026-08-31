require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pool = require('./index');

const CHECKPOINTS = [
  { code: 'C01', title: 'Restaurant concept',         ordinal:  1, tier: 1 },
  { code: 'C02', title: 'Content model',              ordinal:  2, tier: 1 },
  { code: 'C03', title: 'Acceptance criteria',        ordinal:  3, tier: 1 },
  { code: 'C04', title: 'Spec published to the pool', ordinal:  4, tier: 1 },
  { code: 'C05', title: 'HTML structure',             ordinal:  5, tier: 2 },
  { code: 'C06', title: 'HTML validates',             ordinal:  6, tier: 2 },
  { code: 'C07', title: 'Linking a stylesheet',       ordinal:  7, tier: 3 },
  { code: 'C08', title: 'Styled menu',                ordinal:  8, tier: 3 },
  { code: 'C09', title: 'Peer acceptance report',     ordinal:  9, tier: 3 },
  { code: 'C10', title: 'Revision complete',          ordinal: 10, tier: 3 },
  { code: 'C11', title: 'Interactive menu',           ordinal: 11, tier: 4 },
  { code: 'C12', title: 'Data-driven menu',           ordinal: 12, tier: 4 },
];

function parseCardFile(filepath) {
  const text = fs.readFileSync(filepath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`No frontmatter in ${path.basename(filepath)}`);
  const meta = yaml.load(match[1]);
  const body = match[2].trim();
  return { meta, body };
}

async function seed() {
  const cardsDir = path.join(__dirname, '..', 'content', 'cards');
  const cardsByCode = {};

  if (fs.existsSync(cardsDir)) {
    for (const filename of fs.readdirSync(cardsDir).filter(f => f.endsWith('.md'))) {
      const { meta, body } = parseCardFile(path.join(cardsDir, filename));
      cardsByCode[meta.code] = { meta, body };
    }
  }

  for (const cp of CHECKPOINTS) {
    const { rows } = await pool.query(
      `INSERT INTO checkpoints (code, title, ordinal, tier)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE
         SET title = EXCLUDED.title, ordinal = EXCLUDED.ordinal, tier = EXCLUDED.tier
       RETURNING id`,
      [cp.code, cp.title, cp.ordinal, cp.tier]
    );
    const checkpointId = rows[0].id;

    const card = cardsByCode[cp.code];
    if (!card) continue;

    const { meta, body } = card;
    await pool.query(
      `INSERT INTO cards (checkpoint_id, body_md, keywords, video_url, video_seconds, transcript, starter_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (checkpoint_id) DO NOTHING`,
      [
        checkpointId,
        body,
        meta.keywords || [],
        meta.video_url || null,
        meta.video_seconds || null,
        meta.transcript || null,
        meta.starter ? JSON.stringify(meta.starter) : null,
      ]
    );
    console.log(`  Seeded ${cp.code}`);
  }

  console.log('Seed complete.');
}

seed()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
