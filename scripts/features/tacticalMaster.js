const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function mastery(workflow) {
  console.log(workflow)

  const weaponMastery = {
    // simple melee
    'club': 'slow',
    'dagger': 'nick',
    'greatclub': 'push',
    'handaxe': 'vex',
    'javelin': 'slow',
    'light hammer': 'nick',
    'mace': 'sap',
    'quarterstaff': 'topple',
    'sickle': 'nick',
    'spear': 'sap',
    // simple ranged
    'dart': 'vex',
    'light crossbow': 'slow',
    'shortbow': 'vex',
    'sling': 'slow',
    // martial melee
    'battleaxe': 'topple',
    'flail': 'sap',
    'glaive': 'graze',
    'greataxe': 'cleave',
    'greatsword': 'graze',
    'halberd': 'cleave',
    'lance': 'topple',
    'longsword': 'sap',
    'maul': 'topple',
    'morningstar': 'sap',
    'pike': 'push',
    'rapier': 'vex',
    'scimitar': 'nick',
    'shortsword': 'vex',
    'trident': 'topple',
    'warhammer': 'push',
    'war pick': 'sap',
    'whip': 'slow',
    // martial ranged
    'blowgun': 'vex',
    'hand crossbow': 'vex',
    'heavy crossbow': 'push',
    'longbow': 'slow',
    'musket': 'slow',
    'pistol': 'vex'
  }

  // workflow.actor.itemTypes.weapon.find(i => i.name.toLowerCase().search(seasonWeapons.get(currentSeason)) != -1), {"system.equipped": false}
  // workflow.actor.itemTypes.weapon[].system.type.baseItem
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