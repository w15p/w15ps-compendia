const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function late({ workflow }) {
  if (!workflow.targets.size) return;
  let uses = workflow.item.system.uses.value;
  if (!uses) {
    genericUtils.notify(genericUtils.format('CHRISPREMADES.Macros.LayOnHands.Empty', { itemName: workflow.item.name }), 'info');
    return;
  }
  let targetToken = workflow.targets.first();
  let inputs = [
    ['selectOption',
      [
        {
          label: 'CHRISPREMADES.Macros.LayOnHands.RemoveCondition',
          name: 'condition',
          options: {
            options: [
              {
                value: 'none',
                label: 'DND5E.None'
              }
            ]
          }
        }
      ]
    ],
    ['number',
      [
        {
          label: 'CHRISPREMADES.Macros.LayOnHands.RestoreHitpoints',
          name: 'restore'
        }
      ]
    ]
  ];
  let poisoned = effectUtils.getEffectByStatusID(targetToken.actor, 'poisoned');
  if (poisoned && uses >= 5) inputs[0][1][0].options.options.push({
    value: 'poisoned',
    label: poisoned.name
  });
  let selection = await DialogApp.dialog(workflow.item.name, 'CHRISPREMADES.Macros.LayOnHands.Select', inputs, 'okCancel');
  if (!selection?.buttons) return;
  let { condition, restore } = selection;
  if (condition === 'poisoned') {
    await genericUtils.remove(poisoned);
    uses -= 5;
  }
  let numToHeal = Math.min(uses, restore);
  console.log(numToHeal);
  if (numToHeal <= 0) {
    await workflowUtils.replaceDamage(workflow, '0');
  } else {
    await workflowUtils.replaceDamage(workflow, numToHeal + '[healing]', { damageType: 'healing' });
    uses -= numToHeal;
  }
  await genericUtils.update(workflow.item, { 'system.uses.value': uses });
}
export let layOnHands = {
  name: 'Lay on Hands',
  identifier: 'layOnHands',
  version: '0.12.23',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'damageRollComplete',
        macro: late,
        priority: 50
      }
    ]
  },
  ddbi: {
    correctedItems: {
      'Lay on Hands Pool': {
        system: {
          uses: {
            prompt: false
          }
        }
      }
    },
    renamedItems: {
      'Lay on Hands Pool': 'Lay on Hands'
    }
  }
};