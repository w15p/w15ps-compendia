import { changeSeason } from "./features/changeSeason.js";
import { feyStep } from "./features/feyStep.js";
import { feyTrance } from "./features/feyTrance.js";
import { layOnHands } from "./features/layOnHands.js";
import { lifedrinker } from "./features/lifedrinker.js";
import { sneakAttack } from "./features/sneakAttack.js";
import { stepsOfTheFey } from "./features/stepsOfTheFey.js";
import { tacticalMaster } from "./features/tacticalMaster.js";

async function setupW15ps() {
  // check for existence of W15ps namespace to reuse or create otherwise
  globalThis.W15ps = globalThis.W15ps !== undefined ? globalThis.W15ps : {};
  const w15ps = globalThis.W15ps; // for simpler reference -- future use

  // register with cpr
  chrisPremades.utils.macroUtils.registerMacros([changeSeason, feyStep, feyTrance, layOnHands, lifedrinker, sneakAttack, stepsOfTheFey, tacticalMaster]);

  // add w15ps-grimoire to cpr item compendiums and set as highest priority
  let cprCompendiums = game.settings.get('chris-premades', 'additionalCompendiums');
  if (!Object.keys(cprCompendiums).includes('w15ps-compendia.w15ps-grimoire')) {
    Object.keys(cprCompendiums).forEach(k => cprCompendiums[k] = ++cprCompendiums[k])
    cprCompendiums['w15ps-compendia.w15ps-grimoire'] = 1;
    await game.settings.set('chris-premades', 'additionalCompendiums', cprCompendiums);
  }

  //w15ps.changeSeason = changeSeason; // possible future use
  console.log("%cw15ps-compendia %c| Initialized \n - W15ps registered", "color: #2e5a88; font-weight: bold", "color: #333333; font-weight: normal");
}

export class W15psConfig {
  static module = 'w15ps-compendia';
  static packs = [
    'w15ps-grimoire',
    'w15ps-wares'
  ];
}

Hooks.once('init', async () => {
  await registerSettings();
});

Hooks.once("ready", () => {
  setupW15ps();
});