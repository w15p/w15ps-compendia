import {W15psConfig} from './w15ps.mjs';

export async function registerSettings() {
  game.settings.register("w15ps-compendia", "merge_compendia", {
      name: "Merge Compendia",
      hint: "Merge included compendia into W15p's SRD - this is not reversible",
      scope: "world",
      type: Boolean,
      default: false,
      config: true,
      requiresReload: true
      //onChange: debouncedReload //await W15psConfig.mergeCompendia()
  });

  game.settings.register("w15ps-compendia", "hide_compendia", {
    name: "Hide Compendia",
    hint: "Hide W15p's Compendia - usually used with Merge Compendia",
    scope: "world",
    type: Boolean,
    default: false,
    config: true,
    requiresReload: true
    //onChange: debouncedReload //W15psConfig.hideCompendia()
  });
}