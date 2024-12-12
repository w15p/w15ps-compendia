/*
The Fighter level 9 Tactical Master feature is provided in the 2024 free rules on D&D Beyond: https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Level9TacticalMaster
*/

export async function tacticalMaster(workflow) {
  // review workflow.item.system.masteryOptions
  console.log(workflow.item.system.masteryOptions);

  // extend this conditional to encompass homebrew
  if (!game.settings.get('w15ps-compendia', 'tactical_master_config') ||
    workflow.actor.getFlag('w15ps-compendia', 'weaponMasteryUsed') ||
    !(workflow.actor.system.traits.weaponProf.mastery.value.has(workflow.item.system.identifier) ||
      workflow.actor.system.traits.weaponProf.mastery.value.has(workflow.item.system.type.baseItem))) return;

  // check that actor has bonus masteries but fall back to homebrew (non-PHB2024) if not
  const tacticalChoices = (workflow.actor.system.traits.weaponProf.mastery?.bonus) ?
    Array.from(workflow.actor.system.traits.weaponProf.mastery.bonus) :
    ['push', 'sap', 'slow'];
  const tacticalChoice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Tactical Master" },
    content: "<p>Choose to apply a different weapon mastery for this attack or cancel.</p>",
    modal: true,
    buttons: tacticalChoices.map(e => { return { label: e.capitalize(), action: e } })
  })
  await workflow.actor.setFlag('w15ps-compendia', 'tacticalMastery', tacticalChoice);
};