import { registerSettings } from './settings.js';
//eladrin
import { changeSeason } from "./features/changeSeason.js";
import { feyStep } from "./features/feyStep.js";
import { feyTrance } from "./features/feyTrance.js";
//paladin
import { layOnHands } from "./features/layOnHands.js";
//rogue
import { sneakAttack } from "./features/sneakAttack.js";
//warlock
import { lifedrinker } from "./features/lifedrinker.js";
import { stepsOfTheFey } from "./features/stepsOfTheFey.js";
//weapon mastery
import { tacticalMaster } from "./features/tacticalMaster.js";
import { wmFactory } from "./features/weaponMastery.js";

async function setupW15ps() {
  // check for existence of W15ps namespace to reuse or create otherwise
  globalThis.W15ps = globalThis.W15ps !== undefined ? globalThis.W15ps : {};
  const w15ps = globalThis.W15ps; // for simpler reference

  // export for use with onUseMacros
  w15ps.tacticalMaster = tacticalMaster;
  w15ps.weaponMastery = wmFactory.newWeaponMastery();

  if (game.modules.find(e => e.id === 'chris-premades')?.active) {
    // register with cpr
    chrisPremades.utils.macroUtils.registerMacros([changeSeason, feyStep, feyTrance, layOnHands, lifedrinker, sneakAttack, stepsOfTheFey]);

    // add w15ps-grimoire to cpr item compendiums and set as highest priority
    let cprCompendiums = game.settings.get('chris-premades', 'additionalCompendiums');
    if (!Object.keys(cprCompendiums).includes('w15ps-compendia.w15ps-grimoire')) {
      Object.keys(cprCompendiums).forEach(k => cprCompendiums[k] = ++cprCompendiums[k])
      cprCompendiums['w15ps-compendia.w15ps-grimoire'] = 1;
      await game.settings.set('chris-premades', 'additionalCompendiums', cprCompendiums);
    }
  }

  console.log("%cw15ps-compendia %c| Initialized and `W15ps` registered", "color: #2e5a88; font-weight: bold", "color: #333333; font-weight: normal");
}

export class W15psConfig {
  static module = 'w15ps-compendia';
  static packs = [
    'w15ps-grimoire'
  ];
}

let weapon_mastery_config = false;
Hooks.once('init', async () => {
  await registerSettings();
  weapon_mastery_config = game.settings.get('w15ps-compendia', 'weapon_mastery_config') ??
    true
});

Hooks.once("ready", () => {
  setupW15ps();
});

Hooks.on('dnd5e.preLongRest', (actor) => {
  if (weapon_mastery_config)
    W15ps.weaponMastery.choose(actor);
});