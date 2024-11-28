export async function registerSettings() {
  game.settings.register("w15ps-compendia", "weapon_mastery_config", {
    name: "Weapon Mastery",
    hint: "Prompt for changing Weapon Masteries on a Long Rest?",
    scope: "client",
    type: Boolean,
    default: false,
    config: true,
    requiresReload: true
  });
  game.settings.register("w15ps-compendia", "tactical_master_config", {
    name: "Weapon Mastery",
    hint: "Prompt for Tactical Master weapon mastery choices on every attack?",
    scope: "client",
    type: Boolean,
    default: false,
    config: true,
    requiresReload: true
  });
}