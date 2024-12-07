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
import { logMsg } from "../utils.js";

export async function weaponMastery(args, workflow, macroItem) {
  console.log(workflow.macroPass);
  const feature = 'Weapon Mastery';
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

  const mastery = workflow.actor.getFlag('w15ps-compendia', 'tacticalMastery') ??
    weapons.find(e => e.id === workflow.item.system.identifier || e.baseItem === workflow.item.system.type.baseItem)?.mastery;
  if (workflow.macroPass !== 'postAttackRollComplete') workflow.actor.unsetFlag('w15ps-compendia', 'tacticalMastery');

  const masteryTarget = workflow.targets.first();
  let mod = (workflow.item.abilityMod) ? // handle the topple call
    workflow.actor.system.abilities[workflow.item.abilityMod].mod:
    null;

  console.log(workflow.actor.getFlag('w15ps-compendia', 'tacticalMastery'));
  console.log('weapon mastery')
  console.log(mastery);

  const usedMastery = {
    name: "usedMastery",
    transfer: false,
    img: "icons/skills/ranged/arrow-flying-spiral-blue.webp",
    origin: macroItem.uuid,
    type: "base",
    changes: [
      {
        key: `flags.w15ps-compendia.used${mastery.capitalize()}`,
        value: true
      }
    ],
    disabled: false,
    duration: {
      turns: 1
    },
    flags: {
      dae: {
        showIcon: true
      }
    }
  };

  switch (true) {
    case (mastery === 'cleave' && !workflow.actor.getFlag('w15ps-compendia', `used${mastery.capitalize()}`)):
      if (workflow.actor.getFlag('w15ps-compendia', 'weaponMasteryUsed') === 'cleave' && workflow.macroPass === 'postAttackRollComplete' ) {
        if (workflow.hitTargets.size) {
          // only include modifier if negative
          console.log(`mod: ${mod}`)
          let negMod = (mod < 0) ? mod : 0; //  + ${negMod}
          console.log(`negMod: ${negMod}`)
          let cleaveRoll = await new CONFIG.Dice.DamageRoll(`${workflow.item.labels.damage} + ${workflow.item.system.magicalBonus}`, {}, { type: workflow.item.labels.damageTypes, properties: [...workflow.item.system.properties] }).evaluate();
          await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [masteryTarget], cleaveRoll, { itemCardUuid: workflow.itemCardUuid });
        }
        workflow.actor.unsetFlag('w15ps-compendia', 'weaponMasteryUsed');
        await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [usedMastery] });
        return;
      } else if (workflow.macroPass !== 'postAttackRollComplete'){
        if (!workflow.hitTargets.size || workflow.targets.size !== 1) return;
        const validTargets = MidiQOL.findNearby(['hostile', 'neutral'], workflow.token, workflow.item.system.range.reach,
          { includeIncapacitated: false, isSeen: true, includeToken: false, relative: false });
        const cleaveTargets = MidiQOL.findNearby(['hostile', 'neutral'], masteryTarget, 5,
          { includeIncapacitated: false, includeToken: false, relative: false }).filter(e => validTargets.includes(e));
        const cleaveChoice = await foundry.applications.api.DialogV2.wait({
          window: { title: `${feature} (Cleave)` },
          content: "<p>Choose a target to Cleave:</p>",
          modal: true,
          buttons: cleaveTargets.map(e => {
            return {
              class: "dialog .window-content .dialog-form footer.form-footer",
              label: `<img src="${e.actor.img}" width="25px" style="border: 0px" /> ${e.actor.name}`, action: e.document.uuid
            }
          })
        });
        let cleaveData = workflow.item.toObject();
        let cleaveItem = new CONFIG.Item.documentClass(cleaveData, { parent: workflow.actor });
        let cleaveOptions = {
          targetUuids: [cleaveChoice]
        };
        await workflow.actor.setFlag('w15ps-compendia', 'weaponMasteryUsed', 'cleave');
        await MidiQOL.completeItemUse(cleaveItem, {}, cleaveOptions);
      }
      break;

    case (mastery === 'graze' && workflow.macroPass === 'postAttackRollComplete'):
      console.log('graze triggered');

      if (workflow.hitTargets.size || workflow.targets.size !== 1) return;
      const itemData = {
              name: `${feature} (Graze)`,
              type: "feat",
              img: workflow.item.img
          }
      console.log(`mod: ${mod}`)
      let grazeRoll = await new CONFIG.Dice.DamageRoll(`${mod}`, {}, { type: workflow.defaultDamageType, properties: [...workflow.item.system.properties] }).evaluate();
      let grazeWorkflow = await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [masteryTarget], grazeRoll, {flavor: itemData.name, itemData: itemData});

      // non-GM players can't access this through normal workflow - unfortunate as it is a nicer implementation, but the separate chatCard (above) works and this doesn't
      /*
      if (workflow.hitTargets.size || workflow.targets.size !== 1) return;
      // update the chatCard with Graze info
      const chatMessage = game.messages.get(workflow.itemCardId);
      const searchFeature = `<div class="end-midi-qol-hits-display"></div>`;
      const replaceFeature = `<div class="end-midi-qol-hits-display" style="text-align:center">${feature} (Graze)</div>`;
      const searchStyle = 'class="target failure midi-qol midi-qol-hit-class midi-qol-target-select"';
      const replaceStyle = 'class="target success midi-qol midi-qol-hit-class midi-qol-target-select"';
      const searchIcon = '<i class="midi-qol-hit-symbol fas fa-times"></i>';
      const replaceIcon = '<i class="midi-qol-hit-symbol fas fa-check"></i>';
      let grazeContent = chatMessage.content
        .replace(searchFeature, replaceFeature)
        .replace(searchStyle, replaceStyle)
        .replace(searchIcon, replaceIcon);
      let grazeRoll = await new CONFIG.Dice.DamageRoll(`${mod}`, {}, { type: workflow.defaultDamageType, properties: [...workflow.item.system.properties] }).evaluate();
      let grazeWorkflow = await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [masteryTarget], grazeRoll, { itemCardUuid: workflow.itemCardUuid });
      // move chat content search/replace after call if possible to make it work after MidiQOL.DamageOnlyWorkflow()
      //const searchString =  `<div class="midi-qol-damage-roll"><div style="text-align:center">Base Damage</div>`;
      //const replaceString = `<div class="midi-qol-damage-roll"><div style="text-align:center">${feature} (Graze)</div>`;
      */
      break;

    case (mastery === 'nick' && workflow.macroPass !== 'postAttackRollComplete' && !workflow.actor.getFlag('w15ps-compendia', `used${mastery.capitalize()}`)): // this is lame - I want more
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
      await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [usedMastery] });
      break;

    case (mastery === 'push' && workflow.macroPass !== 'postAttackRollComplete'): // adapted from thatlonelybugbear's code on MISC - only supports `game.canvas.grid.diagonals = 0`
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      if (['huge', 'grg'].includes(masteryTarget.actor.system.traits.size)) {
        logMsg(`Push only works on large or smaller creatures and the target is ` +
          `${CONFIG.DND5E.actorSizes[masteryTarget.actor.system.traits.size].label}.`, feature);
        return;
      }
      if (game.canvas.grid.diagonals !== 0) logMsg(`Push requires equidistant diagonals to be set in core settings`, feature);
      const distance = 10; //in ft
      const animateMovement = true; //false
      const targetCenter = masteryTarget.center;
      const tokenCenter = workflow.token.center;
      const gridDistance = await game.canvas.grid.distance;
      const gridMove = distance / gridDistance;
      const gridSize = await game.canvas.grid.size;
      let dir = { // handles both Large and Tiny creatures
        x: (targetCenter.x - tokenCenter.x) / (gridSize / 4),
        y: (targetCenter.y - tokenCenter.y) / (gridSize / 4)
      }
      // only move in full grid units, supports 16 directions of movement
      switch (true) {
        case (Math.abs(dir.x) === Math.abs(dir.y)):
          dir.x = Math.sign(dir.x) * gridMove;
          dir.y = Math.sign(dir.y) * gridMove;
          break;
        case (dir.y === 0):
          dir.x = Math.sign(dir.x) * gridMove;
          break;
        case (dir.x === 0):
          dir.y = Math.sign(dir.y) * gridMove;
          break;
        case (Math.abs(dir.x / dir.y) > 1):
          let yMod = Math.abs(dir.y / dir.x);
          dir.x = Math.sign(dir.x) * gridMove;
          dir.y = Math.round(yMod * Math.sign(dir.y) * gridMove)
          break;
        case (Math.abs(dir.x / dir.y) < 1):
          let xMod = Math.abs(dir.x / dir.y);
          dir.x = Math.round(xMod * Math.sign(dir.x) * gridMove)
          dir.y = Math.sign(dir.y) * gridMove;
          break;
        default:
          logMsg(`Error - unsupported direction (${dir.x}, ${dir.y})`, feature, 'Push');
      }
      const targetMove = { // target size fudge factor for position -> center
        x: (targetCenter.x + dir.x * gridSize) - masteryTarget.shape.width * 0.5,
        y: (targetCenter.y + dir.y * gridSize) - masteryTarget.shape.height * 0.5
      }
      await MidiQOL.moveToken(masteryTarget, targetMove, animateMovement);
      break;

    case (mastery === 'sap' && workflow.macroPass !== 'postAttackRollComplete'):
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
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
      await MidiQOL.createEffects({ actorUuid: masteryTarget.actor.uuid, effects: [sapEffect] });
      break;

    case (mastery === 'slow' && workflow.macroPass !== 'postAttackRollComplete'): // adapted from Moto 'Moo Deng' Moto's slow macro
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
      await MidiQOL.createEffects({ actorUuid: masteryTarget.actor.uuid, effects: [slowEffect] });
      break;

    case (mastery === 'topple' && workflow.macroPass !== 'postAttackRollComplete'):
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
      let topple = await fromUuid("Item.KDDceMCNvevtLJVu");
      let charm = await fromUuid("Item.f0EFIISMuf7qOGKc");
      const toppleData = {
        _id: "weaponMasteryTop",
        name: `${feature} (Topple)`,
        type: "feat",
        img: "icons/weapons/staves/staff-simple.webp",
        effects: [
          {
            _id: "toppleEffect0000",
            name: "Prone",
            transfer: false,
            statuses: ["prone"]
          }
        ],
        flags: {
          "midi-qol": {
            noProvokeReaction: true,
            forceCEOff: true
          },
          "midiProperties": {
            saveDamage: "nodam",
          },
          "autoanimations": {
            killAnim: true
          }
        },
        system: {
          activities: {
            toppleActivity00: {
              _id: "toppleActivity00",
              type: "save",
              save: { dc: { calculation: '', formula: '8 + @mod + @prof' }, ability: ['con'] },
              effects: [{ _id: "toppleEffect0000", onSave: false }],
              duration: { units: "inst", value: undefined },
              consumption: { spellSlot: false }
            }
          },
          equipped: true
        }
      };
      const toppleItem = new CONFIG.Item.documentClass(toppleData, { parent: workflow.actor });
      let toppleOptions = {
        createWorkflow: true,
        targetUuids: [masteryTarget.document.uuid]
      };
      const toppleWorkflow = await MidiQOL.completeItemUse(toppleItem, {}, toppleOptions);
      console.log(toppleWorkflow);
      break;

    case (mastery === 'vex' && workflow.macroPass !== 'postAttackRollComplete'):
      if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
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
      await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [vexEffect] });
      break;

    default:
    // this triggers on the topple synthetic item workflow so suppressing the error for now
    //logMsg(`Error - no mastery of the weapon used (${workflow.item.system.name}) or an unsupported mastery (${mastery})`, feature);
  }
}