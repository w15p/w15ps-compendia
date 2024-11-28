const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function use({ workflow }) {
  if (workflow.actor.items.find(c => c.system.identifier === 'warlock').system.levels < 3 ||
    !workflow.actor.items.find(c => c.system.identifier === 'the-archfey')) return;
  let buttons = new Array();
  buttons.push(['Refreshing Step', 'refreshing', { image: 'icons/magic/nature/lotus-glow-pink.webp' }]);
  buttons.push(['Taunting Step', 'taunting', { image: 'icons/magic/control/fear-fright-shadow-monster-green.webp' }]);
  if (workflow.actor.items.find(c => c.system.identifier === 'warlock').system.levels >= 6) {
    buttons.push(['Disappearing Step', 'disappearing', { image: 'icons/magic/control/silhouette-hold-change-blue.webp' }]);
    buttons.push(['Dreadful Step', 'dreadful', { image: 'icons/magic/death/projectile-skull-fire-purple.webp' }]);
  }
  let stepsEffect = await dialogUtils.buttonDialog(workflow.item.name, 'Steps of the Fey', buttons);
  if (!stepsEffect) return;
  let animation = (itemUtils.getConfig(workflow.item, 'playAnimation') && animationUtils.jb2aCheck()) ? 'mistyStep' : 'none';
  switch (stepsEffect) {
    case 'refreshing': {
      await Teleport.target(workflow.token, workflow.token, {
        animation,
        range: 30
      });
      let nearbyTargets = tokenUtils.findNearby(workflow.token, 10, { incldueIncapacitated: false, includeToken: false }).filter(i => tokenUtils.canSee(workflow.token, i));
      nearbyTargets.push(workflow.token);
      let target;
      if (!nearbyTargets.length) return;
      if (nearbyTargets.length > 1) {
        [[target]] = await dialogUtils.selectTargetDialog(workflow.item.name + ' (Refreshing Step)', genericUtils.format('Select a target to refresh', { max: 1 }), nearbyTargets, {
          type: 'multiple'
        });
      }
      genericUtils.update(target.actor, { "system.attributes.hp.temp": 10 })
      break;
    }
    case 'taunting': {
      let featureData = await compendiumUtils.getItemFromCompendium('world.w15ps-grimoire', 'Steps of the Fey (Taunting Step)',
        { object: true });
      // configuration check for applying to friendly tokens
      let nearbyTargets = tokenUtils.findNearby(workflow.token, 5, (!itemUtils.getConfig(workflow.item, 'tauntFriends')) ? 'enemy' : null, { includeIncapacitated: false, includeToken: false });
      let workflowReturn = await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, nearbyTargets, { killAnim: true });
      //let workflowReturn = await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [], { killAnim: true });
      console.clear();
      console.log('nearbyTargets:');
      console.log(nearbyTargets);
      console.log('workflowReturn.targets:');
      console.log(workflowReturn.targets);
      let effectData = {
        name: workflow.item.name + ' (TauntingStep)',
        img: featureData.img,
        origin: workflow.item.uuid,
        duration: {
          rounds: 1
        },
        changes: [
          {
            key: 'flags.midi-qol.disadvantage.attack.all',
            mode: 0,
            value: 'targetActorUuid !== "' + workflow.actor.uuid + '"',
            priority: 20
          }
        ],
        flags: {
          dae: {
            specialDuration: [
              'turnEndSource'
            ]
          }
        }
      };
      await Promise.all(nearbyTargets.map(i => effectUtils.createEffect(i.actor, effectData)));
      await Teleport.target(workflow.token, workflow.token, { range: 30, animation });
      break;
    }
    case 'disappearing': {
      let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        flags: {
          dae: {
            specialDuration: [
              '1Attack',
              '1Spell',
              'turnStartSource'
            ]
          },
          'chris-premades': {
            conditions: ['invisible']
          }
        }
      };
      let animation = itemUtils.getConfig(workflow.item, 'playAnimation') ? 'mistyStep' : 'none';
      await Teleport.target(workflow.token, workflow.token, { range: 30, animation });
      await effectUtils.createEffect(workflow.actor, effectData);
      break;
    }
    // This applies to all creatures, friends and enemies alike (RAW)
    case 'dreadful': {
      let featureData = await compendiumUtils.getItemFromCompendium('world.w15ps-grimoire', 'Steps of the Fey (Dreadful Step)',
        { object: true });
      if (!featureData) return;
      let dreadOption = new Array();
      dreadOption.push(['Inflict dread at your origin', 'origin', { image: 'icons/magic/control/energy-stream-link-large-orange.webp' }]);
      dreadOption.push(['Inflict dread at your destination', 'destination', { image: 'icons/magic/control/energy-stream-link-orange.webp' }]);
      console.log(dreadOption);
      dreadSource = await dialogUtils.buttonDialog(workflow.item.name + '(Dreadful Step)', '', dreadOption);
      switch (dreadSource) {
        case 'origin': {
          await dreadEffect(workflow);
          await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [], { killAnim: true });
          await Teleport.target(workflow.token, workflow.token, { range: 30, animation });
          break;
        }
        case 'destination': {
          await Teleport.target(workflow.token, workflow.token, { range: 30, animation });
          await dreadEffect(workflow);
          await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [], { killAnim: true });
          break;
        }
      }
      break;
    }
  }
}

async function dreadEffect(workflow) {
  let nearbyTargets = tokenUtils.findNearby(workflow.token, 5, { includeIncapacitated: false, includeToken: true });
  nearbyTargets.forEach(target => {
    new Sequence()
      .effect()
      .file('modules/jb2a_patreon/Library/Generic/Conditions/Curse01/ConditionCurse01_001_Purple_600x600.webm')
      .scaleToObject(1.45)
      .atLocation(target)
      .play();
  });
}

export let stepsOfTheFey = {
  name: 'Steps of the Fey',
  identifier: 'stepsOfTheFey',
  version: '0.12.64',
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
      value: 'playAnimation',
      label: 'CHRISPREMADES.Config.PlayAnimation',
      type: 'checkbox',
      default: true,
      category: 'animation'
    },
    {
      value: 'tauntFriends',
      label: 'Target friendly tokens with Taunting Step? (RAW)',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: true,
      category: 'homebrew'
    }
  ]
};