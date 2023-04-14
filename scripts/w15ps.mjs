const module = 'w15ps-compendia';
const packs = [
  'w15ps-grimoire',
  'w15ps-talents-and-feats'
];

async function combineCompendia(pack) {
  let source = game.packs.get(`${module}.${pack}`);
  let target = game.packs.get(`w15ps-srd.${pack}`);
  // unlock target
  await target.configure({locked: false});
  // import contents
  for (const [k, v] of source.index.entries()) {
    if (target.index.filter(d => d.name === v.name).length === 0) { // check if item has already been imported
      await target.importDocument(await source.getDocument(k));
    }
  }
  // relock target
  await target.configure({locked: true});
  console.log(`%c${module}.${pack} has been merged with w15ps-srd.${pack}`, "color: #2e5a88;");
}

Hooks.once('ready', async () => {
  packs.forEach(async pack => {
    await combineCompendia(pack);
  });
});

Hooks.on('renderCompendiumDirectory', (app, html, options) => {
  packs.forEach(pack => {
    html.find(`li[data-pack="${module}.${pack}"]`).remove()
  });
});