/*
 * With considerable assistance from the entire CPR crew (Chris, Autumn225, and Michael), gambit, thatlonelybugbear, and Moto 'Moo Deng' Moto
 * This implementation requires dnd5e 4.1.x + and the WOTC 2024 Players Handbook.
 * If you want to fork the module and remove that dependency, you'll have to set up some things manually and others will require a rewrite
 * 
 * storing weapon masteries on an actor id done by putting them in a flag, eg:
 * `actor.setFlag('w15ps-compendia, 'mastery', ['shortsword', 'dagger']);` etc - there's no limit on the number of masteries here
 * 
 * weapon-to-mastery mapping also needs to be set up as a js file, populate ./weaponMasteries.js with your data
 */

import { weaponMasteries } from "./weaponMasteries.js"; // import regardless of whether homebrew is used

export async function weaponMastery(args, workflow, macroItem) {

  const masteries = game.packs.has("dnd-players-handbook.equipment") ? // for optonal homebrew instead of official source
    workflow.actor.system.traits.weaponProf.mastery.value :
    new Set(workflow.actor.getFlag('w15ps-compendia', 'mastery'));

  const weapons = game.packs.has("dnd-players-handbook.equipment") ? // for optonal homebrew instead of official source
    Array.from(await game.packs.get("dnd-players-handbook.equipment").getDocuments({
      type: "weapon",
      system: {
        mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries)
      }
    }))
      .filter(e => masteries.has(e.system.identifier))
      .map(e => { return { id: e.system.identifier, baseItem: e.system.type.baseItem, mastery: e.system.mastery } }) :
    weaponMasteries.filter(e => masteries.has(e.id));

  let mastery = workflow.actor.getFlag('w15ps-compendia', 'tacticalMastery') ??
    weapons.find(e => e.id === workflow.item.system.identifier || e.baseItem === workflow.item.system.type.baseItem)?.mastery;
  workflow.actor.unsetFlag('w15ps-compendia', 'tacticalMastery')

  const masteryTarget = workflow.targets.first();
  let mod = workflow.actor.system.abilities[workflow.item.abilityMod].mod;
  switch (mastery) {
    case 'cleave':
      // future development
      break;

    case 'graze': // works "perfectly"
      if (workflow.hitTargets.size || workflow.targets.size !== 1) return;
      const grazeData = {
        type: "feat",
        img: workflow.item.img
      }
      let damageRoll = await new CONFIG.Dice.DamageRoll(`${mod}`, {}, { type: workflow.defaultDamageType, properties: [...workflow.item.system.properties] }).evaluate();
      await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, masteryTarget, damageRoll, { flavor: 'Weapon Mastery: Graze', itemData: grazeData });
      break;

    case 'nick': // this is lame - I want more
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      const nickData = {
        type: "feat",
        img: workflow.item.img
      }
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: workflow.actor }),
        flavor: 'Weapon Mastery: Nick',
        content: (await fromUuid(CONFIG.DND5E.weaponMasteries.nick.reference)).text.content
      })
      break;

    case 'push':
      // future development
      break;

    case 'sap': // works "perfectly"
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      //const sapTarget = workflow.targets.first();
      const sapEffect = {
        name: "Sap",
        transfer: false,
        img: "icons/magic/unholy/hand-claw-glow-orange.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
          {
            key: "flags.midi-qol.disadvantage.attack.all", 
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: 1,
            priority: 20
          }
        ],
        disabled: false,
        flags: {
          dae: {
            showIcon: true,
            specialDuration: [
              'turnStartSource'
            ]
          }
        }
      };
      await MidiQOL.socket().executeAsGM('createEffects', { actorUuid: masteryTarget.actor.uuid, effects: [sapEffect] });
      break;

    case 'slow':  // works "perfectly" // adapted from Moto 'Moo Deng' Moto's slow macro
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      const slowEffect = {
        name: "Slow",
        transfer: false,
        img: "icons/skills/movement/arrow-down-pink.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
          {
            key: "system.attributes.movement.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "-10",
            priority: 20
          }
        ],
        disabled: false,
        flags: {
          dae: {
            showIcon: true,
            specialDuration: [
              'turnStartSource'
            ]
          }
        }
      };
      await MidiQOL.socket().executeAsGM('createEffects', { actorUuid: masteryTarget.actor.uuid, effects: [slowEffect] });
      break;

    case 'topple':
      // future development
      //this is all broken but I am committing now to just get something out
      /*
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      const testEffect = {
        name: "Slow",
        transfer: false,
        img: "icons/skills/movement/arrow-down-pink.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
          {
            key: "system.attributes.movement.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "-10",
            priority: 20
          }
        ],
        disabled: false,
        flags: {
          dae: {
            showIcon: true,
            specialDuration: [
              'turnStartSource'
            ]
          }
        }
      };
      const toppleEffect = {
        name: "Topple",
        transfer: false,
        saveAbility: 'con',
        saveDC: 14,
        //saveDC: `8 + ${mod}`,// + @prof`,
        type: "base",
        changes: [
          {
            key: "statuses",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD, // or should this be CUSTOM?
            value: 'prone',
            priority: 20
          }
        ],
        disabled: false
      }
      console.log(workflow);
      await MidiQOL.doOverTimeEffect(masteryTarget.actor, toppleEffect);
      */
      break;

    case 'vex': // works "perfectly"
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      //const vexTarget = workflow.targets.first();
      const vexEffect = {
        name: "Vex",
        transfer: false,
        img: "icons/skills/melee/maneuver-sword-katana-yellow.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
          {
            key: "flags.midi-qol.advantage.attack.all", 
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `targetId == "${masteryTarget.id}"`,
            priority: 20
          }
        ],
        disabled: false,
        flags: {
          dae: {
            showIcon: true,
            specialDuration: [
              'turnEndSource',
              '1Attack'
            ]
          }
        }
      };
      await MidiQOL.socket().executeAsGM('createEffects', { actorUuid: workflow.actor.uuid, effects: [vexEffect] });
      break;

    default:
      console.log(`No mastery of the weapon used (${workflow.item.system.name}) or an unsupported mastery (${mastery})`);
  }
}