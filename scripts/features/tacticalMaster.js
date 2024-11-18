const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function mastery(workflow) {
  console.log(workflow)

  const weaponMastery = {
    //populate with query from chooseWeaponMasteries if needed
  }
}

export let tacticalMaster = {
  name: 'Tactical Master',
  identifier: 'tacticalMaster',
  version: '0.12.70',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: mastery,
        priority: 50
      }
    ]
  }
};