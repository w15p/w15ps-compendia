export async function tacticalMaster(workflow) {
  if (!game.settings.get('w15ps-compendia', 'tactical_master_config') ||
    !(workflow.actor.system.traits.weaponProf.mastery.value.has(workflow.item.system.identifier) ||
      workflow.actor.system.traits.weaponProf.mastery.value.has(workflow.item.system.type.baseItem))) return;

  // add support for flag-based homebrew here
  const tacticalChoices = Array.from(workflow.actor.system.traits.weaponProf.mastery.bonus);
  const tacticalChoice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Tactical Master" },
    content: "<p>Choose to apply a different weapon mastery for this attack or cancel.</p>",
    modal: true,
    buttons: tacticalChoices.map(e => { return { label: e.capitalize(), action: e } })
  })
  await workflow.actor.setFlag('w15ps-compendia', 'tacticalMastery', tacticalChoice);
};