const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function rest({ trigger }) {
  if (itemUtils.getConfig(trigger.entity, 'restPrompt')) {
    await trigger.entity.use();
  }
}

async function use({ trigger, workflow }) {
  console.log("Fey Trance");
  /*
  FIXME: add ability to track proficiencies granted by Trance
  let prevProfs = Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) ?
      Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) :
      [];
*/
  const toolOptions = await dnd5e.documents.Trait.categories("tool");
  const weaponOptions = await dnd5e.documents.Trait.categories("weapon");

  let exclusions = new Set(['game', 'music', 'vehicle']);
  Object.keys(workflow.actor.system.tools).forEach(i => exclusions.add(i));
  Array.from(workflow.actor.system.traits.weaponProf.value).forEach(i => exclusions.add(i));

  let weaponToolInput =
    Object.entries(toolOptions)
      .concat(Object.entries(weaponOptions))
      .filter(n => !exclusions.has(n[0])) // exclude top-level and categories
      .flatMap(i => {
        if (i[1].children) {
          return Object.entries(i[1].children)
            .map(j => ({ name: j[0], label: j[1].label }));//, options: {isChecked: prevProfs.includes(j.name)}}));
        }
        return { name: i[0], label: i[1].label };
      }).filter(n => !exclusions.has(n.value)); // exclude children

  let tranceChoice = await DialogApp.dialog(workflow.item.name, 'Choose 2 tool or weapon proficiencies:',
    [['checkbox', weaponToolInput, { totalMax: 2, displayAsRows: true }]], 'okCancel',
    { id: 'feyTrance', height: 800 })
  console.log(workflow, tranceChoice);
  if (!tranceChoice.buttons) return;
  let choices = Object.entries(tranceChoice).filter(e => e.key !== 'buttons').filter(e => e.value === true);
  console.log(choices);
}

export let feyTrance = {
  name: 'Trance',
  identifier: 'feyTrance',
  version: '0.12.64',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 50
      }
    ]
  },
  config: [
    {
      value: 'restPrompt',
      label: 'Prompt for trance choices at long rest?',
      i18nOption: 'CHRISPREMADES.Macros.FeyTrance',
      type: 'checkbox',
      default: false,
      category: 'homebrew'
    }
  ],
  rest: [
    {
      pass: 'long',
      macro: rest,
      priority: 60
    }
  ]
};