import {registerSettings} from './settings.js';

export class W15psConfig {
  static module = 'w15ps-compendia';
  static packs = [
    'w15ps-grimoire',
    'w15ps-talents-and-feats'
  ];

  static async mergeCompendia() {
    let merge = null;
    try {
      merge = game.settings.get(this.module,'merge_compendia');
    } catch {
      merge = false;
    }

    if (merge) {
      this.packs.forEach(async pack => {
        let source = game.packs.get(`${this.module}.${pack}`);
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
        console.log(`%c${this.module}.${pack} has been merged with w15ps-srd.${pack}`, "color: #2e5a88;");
      });
    }
  }

  static hideCompendia() {
    let hide = null;
    try {
      hide = game.settings.get(this.module,'hide_compendia')
    } catch {
      hide = false;
    }

    if (hide) {
      this.packs.forEach(pack => {
        $(`li[data-pack="${this.module}.${pack}"]`).hide(); //remove();
        console.log(`%c${this.module}.${pack} has been hidden`, "color: #2e5a88;");
      });
    } else {
      this.packs.forEach(pack => {
        $(`li[data-pack="${this.module}.${pack}"]`).show();
        console.log(`%c${this.module}.${pack} has been restored`, "color: #2e5a88;");
      });
    }
  }
}

Hooks.once('init', async () => {
  await registerSettings();
});

Hooks.once('ready', async () => {
  await W15psConfig.mergeCompendia();
});

Hooks.on('renderCompendiumDirectory', () => {
  W15psConfig.hideCompendia();
});