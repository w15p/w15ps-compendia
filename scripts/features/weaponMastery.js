/*
 * With considerable assistance from the entire CPR crew (Chris, Autumn225, and Michael), gambit, thatlonelybugbear, and Moto 'Moo Deng' Moto
 * This implementation requires dnd5e 4.1.x + and optionally the WOTC 2024 Players Handbook.
 * 
 * Storing weapon masteries on an actor is done by putting them in a flag, eg:
 * `actor.setFlag('w15ps-compendia, 'mastery', ['shortsword', 'dagger']);` etc, there's no limit on the number of masteries here
 */

import { weaponMasteries } from "../reference/weaponMasteries.js";
import { masteryProperties } from "../reference/masteryProperties.js";
import { classMasteries } from "../reference/classMasteries.js";
import { logMsg } from "../utils.js";

class WeaponMastery {
  // define common elements here
  usedMastery = {
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

  static getMasteries(actor) { // handles _PHB and _Free
    return actor.system.traits.weaponProf.mastery.value;
  }
  static async getWeapons(masteries) { // handles _Free and _Legacy
    return weaponMasteries.filter(e => masteries.has(e.id));
  }
  static async getMasteryProperties(mastery) { // handles _Free and _Legacy
    return `<p>${masteryProperties[mastery]}</p>`;
  }
  static async workflow(workflow, macroItem) {
    const feature = 'Weapon Mastery';
    const masteries = this.getMasteries(workflow.actor);
    const weapons = await this.getWeapons(masteries);
    const masteryTarget = workflow.targets.first();
    const mastery = workflow.actor.getFlag('w15ps-compendia', 'tacticalMastery') ??
      weapons.find(e => e.id === workflow.item.system.identifier || e.baseItem === workflow.item.system.type.baseItem)?.mastery;
    if (workflow.macroPass !== 'postAttackRollComplete') workflow.actor.unsetFlag('w15ps-compendia', 'tacticalMastery');
    const mod = (workflow.item.abilityMod) ? // handle the topple call
      workflow.actor.system.abilities[workflow.item.abilityMod].mod :
      null;
    switch (true) {
      case (mastery === 'cleave' && !workflow.actor.getFlag('w15ps-compendia', `used${mastery.capitalize()}`)):
        if (workflow.actor.getFlag('w15ps-compendia', 'weaponMasteryUsed') === 'cleave' && workflow.macroPass === 'postAttackRollComplete') {
          if (workflow.hitTargets.size) {
            let negMod = (mod < 0) ? mod : 0; // only include modifier if negative
            let cleaveRoll = await new CONFIG.Dice.DamageRoll(`${workflow.item.labels.damage} + ${workflow.item.system.magicalBonus} + ${negMod}`, 
              {}, { type: workflow.item.labels.damageTypes, properties: [...workflow.item.system.properties] }).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [masteryTarget], cleaveRoll, { itemCardUuid: workflow.itemCardUuid });
          }
          workflow.actor.unsetFlag('w15ps-compendia', 'weaponMasteryUsed');
          await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [this.usedMastery] });
          return;
        } else if (workflow.macroPass !== 'postAttackRollComplete') {
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
        if (workflow.hitTargets.size || workflow.targets.size !== 1) return;
        const itemData = {
          name: `${feature} (Graze)`,
          type: "feat",
          img: workflow.item.img
        }
        let grazeRoll = await new CONFIG.Dice.DamageRoll(`${mod}`, {}, { type: workflow.defaultDamageType, properties: [...workflow.item.system.properties] }).evaluate();
        await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [masteryTarget], grazeRoll, { flavor: itemData.name, itemData: itemData });
        break;

      case (mastery === 'nick' && workflow.macroPass !== 'postAttackRollComplete' && !workflow.actor.getFlag('w15ps-compendia', `used${mastery.capitalize()}`)): // this is lame - I want more
        if (!workflow.hitTargets.size || workflow.hitTargets.size !== 1) return;
        const nickData = {
          type: "feat",
          img: workflow.item.img
        }
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: workflow.actor }),
          flavor: 'Weapon Mastery: Nick',
          content: this.getMasteryProperties(mastery)
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
        const distance = 10; // in ft
        const animateMovement = true;
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
                duration: { units: "disp", concentration: false },
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

  static async getClassMasteries(actor) { // handles _FREE and _Legacy
    let masteryGrants = Object.entries(actor.classes)
      .map(([i, d]) => (classMasteries.find((c) => c.id === i)?.masteries ?? []).filter((t) => t.level <= d.system.levels))
      .flat(2)
      .reduce((totalGrants, { grants }) => totalGrants + grants, 0);
    return [masteryGrants, new Set(), ''];
  }
  static async getWeaponChoices(weaponProfs) { // handles _Free    
    let weapons = await game.packs.get("dnd5e.items").getDocuments({
      type: "weapon",
      system: {
        identifier__in: Array.from(weaponProfs)
      }
    });
    return weapons.forEach(e => e.system.mastery = weaponMasteries.find(f => f.baseItem === e.system.identifier).mastery);
  }
  static async updateMasteries(actor, chosenMasteries, disabledMasteries) {  // handles _PHB and _Free
    if (chosenMasteries) await actor.update({ "system.traits.weaponProf.mastery.value": chosenMasteries.filter(e => !disabledMasteries.has(e)) });
  }
  static async choose(actor) {
    const feature = "Choose Weapon Masteries";
    // check for whether and how many masteries the actor has
    const [masteryGrants, disabledMasteries, specialMasteries] = await this.getClassMasteries(actor)
    // query existing actor masteries for display in dialog
    const masteries = this.getMasteries(actor);
    // query weapons that the actor is proficient in.
    let weaponProfs = new Set();
    Array.from(actor.system.traits.weaponProf.value).forEach(i => weaponProfs.add(i));
    let weaponsByCategory = await dnd5e.documents.Trait.categories("weapon");
    weaponProfs.forEach(prof => {
      if (Object.keys(weaponsByCategory).includes(prof)) {
        Object.keys(weaponsByCategory[prof].children).forEach(childProf => weaponProfs.add(childProf));
        weaponProfs.delete(prof);
      }
    })
    // populate weapons that the actor is proficient in and have the mastery property 
    const weapons = await this.getWeaponChoices(weaponProfs);
    // gatekeeping and logging
    if (masteryGrants === 0) {
      logMsg(`${actor.name} has no weapon masteries.`, feature);
      return;
    } else {
      masteryGrants === masteries.size ?
        logMsg(`${actor.name} has ${masteryGrants} weapon masteries${specialMasteries}.`, feature) :
        logMsg(`${actor.name} has ${masteries.size} of ${masteryGrants} weapon masteries${specialMasteries}.`, feature);
    }
  
    // format the mastery choices for the dialog
    const masteryChoices = weapons.reduce((acc, weapon) => Object.assign(acc, {
      [weapon.system.identifier]: {
        label: `${weapon.name} (${weapon.system.mastery.capitalize()})`,
        checked: masteries.has(weapon.system.identifier),
      }
    }), {});
  
    /**
     * modified from the original dialog implementation by Zhell
     * @typedef {object} ChoiceConfig
     * @property {string} label           Human-readable label of the option.
     * @property {boolean} [checked]      Whether this option should be selected by default.
     */
  
    /**
     * @enum {ChoiceConfig}
     */
  
    const field = new foundry.data.fields.SetField(new foundry.data.fields.StringField({
      choices: masteryChoices,
    }), {
      label: `Choose ${masteryGrants} weapon masteries:`
    });
  
    const formGroup = field.toFormGroup({
      classes: ["stacked"],
    }, {
      name: "choices",
      value: Object.entries(masteryChoices).filter(c => c[1].checked).map(c => c[0]),
      type: "checkboxes",
    }).outerHTML;
  
    function render(event, html) {
      const choices = html.querySelector("[name=choices]");
      const checkboxes = html.querySelectorAll("[type=checkbox]");
      const button = html.querySelector(".form-footer button");
  
      choices.addEventListener("change", event => {
        choices.value.length >= masteryGrants ? // restrict on selection
          Array.from(checkboxes).filter(e => e.checked !== true).forEach(e => e.disabled = true) :
          Array.from(checkboxes).forEach(e => e.disabled = false);
        Array.from(checkboxes).filter(e => disabledMasteries.has(e.value)).forEach(e => e.disabled = true);
        //button.disabled = choices.value.length !== masteryGrants; // don't allow for fewer mastery selections than actor has granted
      });
  
      choices.value.length >= masteryGrants ? // restrict on load
        Array.from(checkboxes).filter(e => e.checked !== true).forEach(e => e.disabled = true) :
        null;
      Array.from(checkboxes).filter(e => disabledMasteries.has(e.value)).forEach(e => e.disabled = true);
    }
  
    const chosenMasteries = await foundry.applications.api.DialogV2.prompt({
      content: `<fieldset>${formGroup}</fieldset>`,
      rejectClose: false,
      modal: false,
      render: render,
      ok: { callback: (event, button) => button.form.elements.choices.value },
      window: { title: "Weapon Mastery Selection" },
      position: { width: 600, height: "auto" },
    });
  
    await this.updateMasteries(actor, chosenMasteries, disabledMasteries);
  }
}

class WeaponMastery_PHB extends WeaponMastery {
  // define PHB-specific elements here
  static async getWeapons(masteries) {
    return Array.from(await game.packs.get("dnd-players-handbook.equipment").getDocuments({
      type: "weapon",
      system: {
        mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries)
      }
    }))
      .filter(e => masteries.has(e.system.identifier))
      .map(e => { return { id: e.system.identifier, baseItem: e.system.type.baseItem, mastery: e.system.mastery } });
  }

  static async getMasteryProperties(mastery) {
    return (await fromUuid(CONFIG.DND5E.weaponMasteries[mastery].reference)).text.content;
  }

  static async getClassMasteries(actor) {
    let disabledMasteries = new Set();
    let specialMasteries = '';
    const phbClassMasteries = await game.packs.get("dnd-players-handbook.classes").getDocuments({
      type: "class",
      system: { identifier__in: Object.keys(actor.classes) }
    });

    // this can't be a constant as Soul Knife and Fighter need to be able to modify it
    let masteryGrants = Object.entries(actor.classes).map(([i, d]) => phbClassMasteries
      .find(c => c.system.identifier == i).advancement.byType.Trait
      .filter(t => t.level <= d.system.levels &&
        t.configuration.mode === 'mastery')).flat(2)
      .reduce((subGrants, { maxTraits }) => subGrants + maxTraits, 0);

    // FIXME: temporary fix until Fighter is fixed in the 2024 PHB
    // https://github.com/foundryvtt/foundryvtt-premium-content/issues/850
    if (Object.keys(actor.classes).includes('fighter')) {
      actor.classes.fighter.system.levels >= 16 ?
        masteryGrants += 3 :
        actor.classes.fighter.system.levels >= 10 ?
          masteryGrants += 2 :
          actor.classes.fighter.system.levels >= 4 ?
            masteryGrants += 1 :
            null;
    }
    // FIXME: extend at a later date to allow for homebrew
    // populate special class/subclass weapons that have the mastery property
    const classWeapons = await game.packs.get("dnd-players-handbook.classes").getDocuments({
      type: "weapon",
      system: {
        mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries)
      }
    });
    // FIXME: differentiate this based on class
    if (actor.classes.rogue?.subclass?.system.identifier === 'soulknife') {
      classWeapons.forEach(e => weapons.splice(0, 0, e));
      classWeapons.forEach(e => masteries.add(e.system.identifier));
      classWeapons.forEach(e => disabledMasteries.add(e.system.identifier));
      masteryGrants += 1;
      specialMasteries = ' (including soulknife)';
    }
    return [masteryGrants, disabledMasteries, specialMasteries];
  }

  static async getWeaponChoices(weaponProfs) {
    return await game.packs.get("dnd-players-handbook.equipment").getDocuments({
      type: "weapon",
      system: {
        mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries),
        identifier__in: Array.from(weaponProfs)
      }
    });
  }
}

class WeaponMastery_Free extends WeaponMastery {
  // define Free-specific elements here
}

class WeaponMastery_Legacy extends WeaponMastery {
  // define dnd5e 3.3.1-specific elements here
  static getMasteries(actor) {
    // this flag will need to be manually populated and will need to be made clear in the ReadMe
    (actor.getFlag('w15ps-compendia', 'mastery') === undefined) ??
      logMsg(`Weapon Masteries need to be stored in an actor flag, eg: actor.setFlag('w15ps-compendia, 'mastery', ['shortsword', 'dagger']);`, feature);
    return new Set(actor.getFlag('w15ps-compendia', 'mastery'));;
  }

  static async getWeaponChoices(weaponProfs) {      
    let weapons = await game.packs.get("dnd5e.items").getDocuments({
      type: "weapon"
    });
    return weapons.filter(e => Array.from(weaponProfs).includes(e.identifier))
      .forEach(e => e.system['mastery'] = weaponMasteries.find(f => f.baseItem === e.identifier)?.mastery ?? [])
      .forEach(e => e.system['identifier'] = e.identifier);
  }
  
  static async updateMasteries(actor, chosenMasteries, disabledMasteries) {
    if (chosenMasteries) await actor.setFlag('w15ps-compendia', 'mastery', chosenMasteries.filter(e => !disabledMasteries.has(e)));
  }
}

export class wmFactory {
  static newWeaponMastery() {
    return (game.modules.find(e => e.id ==='dnd-players-handbook')?.active) ?
      WeaponMastery_PHB :
      Number(game.system.version.split('.')[0]) === 4 ? 
        WeaponMastery_Free :
        WeaponMastery_Legacy;
  }
}

//graze:
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