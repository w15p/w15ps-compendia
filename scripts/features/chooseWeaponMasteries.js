export async function chooseWeaponMasteries(actor) {

  if (Number(game.system.version.split('.')[0]) !== 4) return;
  // check for whether and how many masteries the actor has
  const classMasteries = await game.packs.get("dnd-players-handbook.classes").getDocuments({
    type: "class",
    system: { identifier__in: Object.keys(actor.classes) }
  });

  // this can't be a constant as Soul Knife and Fighter need to be able to modify it
  let masteryGrants = Object.entries(actor.classes).map(([i, d]) => classMasteries
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

  // query existing actor masteries for display in dialog
  const masteries = actor.system.traits.weaponProf.mastery.value;

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
  const weapons = await game.packs.get("dnd-players-handbook.equipment").getDocuments({
    type: "weapon",
    system: {
      mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries),
      identifier__in: Array.from(weaponProfs)
    }
  });

  // populate special class/subclass weapons that have the mastery property
  const classWeapons = await game.packs.get("dnd-players-handbook.classes").getDocuments({
    type: "weapon",
    system: {
      mastery__in: Object.keys(CONFIG.DND5E.weaponMasteries)
    }
  });

  // FIXME: differentiate this based on class
  let disabledMasteries = new Set();
  let specialMasteries = '';
  if (actor.classes.rogue?.subclass?.system.identifier === 'soulknife') {
    classWeapons.forEach(e => weapons.splice(0, 0, e));
    classWeapons.forEach(e => masteries.add(e.system.identifier));
    classWeapons.forEach(e => disabledMasteries.add(e.system.identifier));
    masteryGrants += 1;
    specialMasteries = ' (including soulknife)';
  }

  // gatekeeping and logging
  if (masteryGrants === 0) {
    console.log(`${actor.name} has no weapon masteries.`);
    return;
  } else {
    masteryGrants === masteries.size ?
      console.log(`${actor.name} has ${masteryGrants} weapon masteries${specialMasteries}.`) :
      console.log(`${actor.name} has ${masteries.size} of ${masteryGrants} weapon masteries${specialMasteries}.`);
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

  const returnValue = await foundry.applications.api.DialogV2.prompt({
    content: `<fieldset>${formGroup}</fieldset>`,
    rejectClose: false,
    modal: false,
    render: render,
    ok: { callback: (event, button) => button.form.elements.choices.value },
    window: { title: "Weapon Mastery Selection" },
    position: { width: 600, height: "auto" },
  });

  if (returnValue) await actor.update({ "system.traits.weaponProf.mastery.value": returnValue.filter(e => !disabledMasteries.has(e)) });
}