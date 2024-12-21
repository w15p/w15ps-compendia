/*
The Fighter level 9 Tactical Master feature is provided in the 2024 free rules on D&D Beyond: https://www.dndbeyond.com/sources/dnd/free-rules/character-classes#Level9TacticalMaster
*/

export async function tacticalMaster(workflow) {
  console.log(workflow.actor)
  if (!game.settings.get('w15ps-compendia', 'tactical_master_config') ||
    workflow.actor.getFlag('w15ps-compendia', 'weaponMasteryUsed') ||
    (Number(game.system.version.split('.')[0]) === 4 && // only make this check in dnd5e v4
      !(workflow.actor.system.traits.weaponProf.mastery?.value.includes(workflow.item.system.identifier) ||
        workflow.actor.system.traits.weaponProf.mastery?.value.includes(workflow.item.system.type.baseItem)))) return;

  // check that actor has bonus masteries but fall back to homebrew (non-PHB2024) if not
  // workflow.item.system.masteryOptions would also work and could maybe be incorporated directly into the chatCard (though that would have the same issues as seen with Graze and non-privileged users)
  const tacticalChoices = (Number(game.system.version.split('.')[0]) === 4) ? 
    Array.from(workflow.actor.system.traits.weaponProf.mastery.bonus) : 
    ['push', 'sap', 'slow']; // part of the free rules referenced above
  const tacticalChoice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Tactical Master" },
    content: "<p>Choose to apply a different weapon mastery for this attack or cancel.</p>",
    modal: true,
    rejectClose: false,
    buttons: tacticalChoices.map(e => { return { label: e.capitalize(), action: e } })
  })
  if (tacticalChoice !== null) await workflow.actor.setFlag('w15ps-compendia', 'tacticalMastery', tacticalChoice);
};