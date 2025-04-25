const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils } } = chrisPremades;

async function damage({ trigger: { entity: item }, workflow }) {
  if (workflow.actor.items.find(c => c.system.identifier === 'warlock').system.levels < 9) return;
  if (workflow.hitTargets.size !== 1 || !(workflow.item.system.actionType == 'mwak' || workflow.item.system.actionType == 'rwak')) return;
  if (!combatUtils.perTurnCheck(item, 'lifeDrinker')) return;
  let damageType = [
    'selectOption',
    [{
      label: 'Damage type:',
      name: 'bonusType',
      options: {
        options: [
          { value: 'necrotic', label: 'Necrotic' },
          { value: 'psychic', label: 'Psychic' },
          { value: 'radiant', label: 'Radiant' }
        ]
      }
    }]
  ];
  let lifedrinker = await DialogApp.dialog(workflow.item.name, 'Choose a damage type if you want to use Lifedrinker on this attack', [damageType], 'okCancel');
  if (!lifedrinker?.buttons) return;
  let bonusFormula = '1d6' + '[' + lifedrinker.bonusType + ']';
  await workflowUtils.bonusDamage(workflow, bonusFormula, { damageType: lifedrinker.bonusType });
  let hitDice = Object.entries(workflow.actor.system.attributes.hd.bySize).filter(e => e[1] > 0).map(i => { return { name: i[0], label: i[0] + ' (' + i[1] + ' remaining)' } });
  let spendHitDie = await DialogApp.dialog(workflow.item.name, 'Choose a hit die to spend or cancel', [['radio', hitDice, { displayAsRows: true }]], 'okCancel');
  if (spendHitDie?.buttons) {
    let rollMod = (workflow.actor.system.abilities.con.mod < 0) ? workflow.actor.system.abilities.con.mod : (workflow.actor.system.abilities.con.mod > 0) ? '+' + workflow.actor.system.abilities.con.mod : '';
    let hitDie = await new Roll('1' + spendHitDie.radio + rollMod, workflow.actor.getRollData()).evaluate();
    await hitDie.toMessage({
      speaker: ChatMessage.implementation.getSpeaker({ actor: workflow.actor }),
      flavor: '<div style="font-style: normal"><b style="font-size:110%">Lifedrinker</b> healing</div>'
    });
    let heal = Math.min(hitDie.total, workflow.actor.system.attributes.hp.max - workflow.actor.system.attributes.hp.value);
    await genericUtils.update(workflow.actor, { "system.attributes.hp.value": workflow.actor.system.attributes.hp.value + heal });
    await genericUtils.update(Object.values(workflow.actor.classes).find(c => c.system.hitDice === spendHitDie.radio), { "system.hitDiceUsed": Object.values(workflow.actor.classes).find(c => c.system.hitDice === spendHitDie.radio).system.hitDiceUsed + 1 })
  }
  await combatUtils.setTurnCheck(item, 'lifeDrinker');
}
async function combatEnd({ trigger: { entity: item } }) {
  await combatUtils.setTurnCheck(item, 'lifeDrinker', true);
}
export let lifedrinker = {
  name: 'Eldritch Invocations: Lifedrinker',
  identifier: 'lifedrinker',
  version: '0.12.70',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: damage,
        priority: 50
      }
    ]
  },
  combat: [
    {
      pass: 'combatEnd',
      macro: combatEnd,
      priority: 50
    }
  ]
};