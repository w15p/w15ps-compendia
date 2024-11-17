/**
 * This is a reimplementation of #Christopher's MidiQOL #items-n-scripts-showcase 2024 Sneak Attack https://discord.com/channels/915186263609454632/1285655740886941789
 */

const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

//Your Code Here:
/**
 * Function to handle the animation of the attack.
 * @param {Object} target - The target of the attack.
 * @param {Object} token - The token representing the attacker.
 * @param {string} attackType - The type of attack (e.g., slashing, bludgeoning, ranged).
 */
async function animation(target, token, attackType) {
  console.log("Animation function called with:", { target, token, attackType }); // Debugging statement
  // Animations by: eskiemoh
  let hitSeq = new Sequence()
    .effect()
    .from(target)
    .atLocation(target)
    .fadeIn(100)
    .fadeOut(100)
    .loopProperty("sprite", "position.x", {
      from: -0.05,
      to: 0.05,
      duration: 75,
      pingPong: true,
      gridUnits: true,
    })
    .scaleToObject(target.document.texture.scaleX)
    .duration(500)
    .opacity(0.15)
    .tint("#fd0706")

    .effect()
    .file("jb2a.particles.outward.red.01.04")
    .atLocation(target)
    .fadeIn(100)
    .fadeOut(400)
    .scaleIn(0, 500, { ease: "easeOutCubic" })
    .scaleToObject(1.65 * target.document.texture.scaleX)
    .duration(800)
    .opacity(1)
    .randomRotation(true)
    .filter("ColorMatrix", { saturate: 1 })
    .belowTokens(true);

  // Switch case to handle different attack types
  switch (attackType) {
    case "slashing":
      new Sequence()
        .effect()
        .file("animated-spell-effects-cartoon.water.105")
        .atLocation(token)
        .scale(0.2 * token.document.width)
        .rotateTowards(target)
        .spriteRotation(80)
        .spriteOffset(
          { x: -0.15 * token.document.width, y: -0.1 * token.document.width },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: 0.75 })
        .rotateIn(-45, 250, { ease: "easeOutExpo" })
        .zIndex(1)

        .effect()
        .file("jb2a.melee_generic.slashing.one_handed")
        .atLocation(token)
        .scale(0.5 * token.document.width)
        .rotateTowards(target)
        .mirrorY()
        .spriteOffset({ x: -1.7 * token.document.width }, { gridUnits: true })
        .filter("ColorMatrix", { saturate: -1, brightness: -1 })
        .rotateIn(-90, 250, { ease: "easeOutBack" })
        .zIndex(0)

        .thenDo(function () {
          hitSeq.play();
        })
        .play();
      return;
    case "bludgeoning":
      new Sequence()
        .effect()
        .file("animated-spell-effects-cartoon.water.115")
        .atLocation(target)
        .scale(0.17 * token.document.width)
        .rotateTowards(token)
        .spriteRotation(0)
        .spriteOffset(
          { x: -0.45 * token.document.width, y: 0 },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: 0.75 })
        .scaleIn(0, 250, { ease: "easeOutExpo" })
        .zIndex(1)

        .effect()
        .file("jb2a.melee_generic.bludgeoning.two_handed")
        .atLocation(target)
        .scale(0.4 * token.document.width)
        .rotateTowards(token)
        .spriteRotation(180)
        .spriteOffset(
          { x: -1 * token.document.width, y: 0 },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: -1, brightness: -1 })
        .scaleIn(0, 250, { ease: "easeOutExpo" })
        .zIndex(0)

        .thenDo(function () {
          hitSeq.play();
        })
        .play();
      return;
    case "ranged":
      new Sequence()
        .effect()
        .file("animated-spell-effects-cartoon.water.109")
        .atLocation(target)
        .scale(0.2 * token.document.width)
        .rotateTowards(token)
        .spriteRotation(0)
        .spriteOffset(
          { x: -0.3 * token.document.width, y: 0 },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: 0.75 })
        .scaleIn(0, 250, { ease: "easeOutExpo" })
        .zIndex(1)

        .effect()
        .file("animated-spell-effects-cartoon.water.115")
        .atLocation(target)
        .scale({ x: 0.1 * token.document.width, y: 0.2 * token.document.width })
        .rotateTowards(token)
        .spriteRotation(0)
        .spriteOffset(
          { x: -0.4 * token.document.width, y: 0 },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: -1, brightness: -1 })
        .scaleIn(0, 250, { ease: "easeOutExpo" })
        .zIndex(0)

        .thenDo(function () {
          hitSeq.play();
        })
        .play();
      return;
    default:
      new Sequence()
        .effect()
        .file("animated-spell-effects-cartoon.water.107")
        .atLocation(token)
        .scale(0.25 * token.document.width)
        .rotateTowards(target)
        .spriteRotation(18)
        .spriteOffset(
          { x: -0.6 * token.document.width, y: -0.25 * token.document.width },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: 0.75 })
        .rotateIn(-25, 250, { ease: "easeOutExpo" })
        .zIndex(1)

        .effect()
        .file("jb2a.melee_generic.piercing.one_handed")
        .atLocation(token)
        .scale(0.5 * token.document.width)
        .rotateTowards(target)
        .spriteRotation(15)
        .mirrorY()
        .spriteOffset(
          { x: -1.9 * token.document.width, y: -0.3 * token.document.width },
          { gridUnits: true }
        )
        .filter("ColorMatrix", { saturate: -1, brightness: -1 })
        .rotateIn(-25, 250, { ease: "easeOutExpo" })
        .zIndex(0)

        .thenDo(function () {
          hitSeq.play();
        })
        .play();
      return;
  }
}

/**
 * Function to handle the damage calculation and application.
 * @param {Object} params - The parameters for the damage function.
 * @param {Object} params.trigger - The trigger for the damage function.
 * @param {Object} params.workflow - The workflow object containing details of the attack.
 */
async function damage({ trigger, workflow }) {
  console.log("Damage function called with:", { trigger, workflow }); // Debugging statement
  // Check if there is exactly one hit target and if the item exists
  if (workflow.hitTargets.size != 1 || !workflow.item) {
    console.warn("No valid hit target or item missing"); // Debugging statement
    return;
  }

  // Get the identifier for the weapon
  let weaponIdentifier = genericUtils.getIdentifier(workflow.item);

  // Check if the attack qualifies for sneak attack
  if (
    !(
      workflow.item.system.actionType === "rwak" ||
      workflow.item.system.properties.has("fin") ||
      weaponIdentifier === "psychicBlades"
    )
  ) {
    console.warn("Attack does not qualify for sneak attack"); // Debugging statement
    return;
  }

  // Check if sneak attack has already been used this turn
  if (
    !combatUtils.perTurnCheck(
      trigger.entity,
      "sneakAttack",
      false,
      workflow.token.id
    )
  )
    return;

  let doSneak = false;
  let displayRakish = false;

  // Determine the roll type (advantage, disadvantage, or normal)
  let rollType =
    workflow.advantage && workflow.disadvantage
      ? "normal"
      : workflow.advantage && !workflow.disadvantage
      ? "advantage"
      : !workflow.advantage && workflow.disadvantage
      ? "disadvantage"
      : "normal";

  // If the roll type is advantage, set doSneak to true
  if (rollType === "advantage") doSneak = true;

  // Get the first target token
  let targetToken = workflow.targets.first();

  // Check for nearby enemies if roll type is not disadvantage and doSneak is false
  if (!doSneak && rollType != "disadvantage") {
    let nearbyTokens = tokenUtils
      .findNearby(targetToken, 5, "enemy", { includeIncapacitated: false })
      .filter((i) => i.id != workflow.token.id);
    if (nearbyTokens.length) doSneak = true;
  }

  // Check for Rakish Audacity feature
  let rakishAudacity = itemUtils.getItemByIdentifier(
    workflow.actor,
    "rakishAudacity"
  );
  if (
    rakishAudacity &&
    rollType != "disadvantage" &&
    !doSneak &&
    tokenUtils.getDistance(workflow.token, targetToken) <= 5
  ) {
    let nearbyTokens = tokenUtils
      .findNearby(workflow.token, 5, "all", { includeIncapacitated: true })
      .filter((i) => i.id != targetToken.id);
    if (!nearbyTokens.length) {
      doSneak = true;
      displayRakish = true;
    }
  }

  // Check for Insightful Fighting effect
  let insightfulFightingEffect = effectUtils.getEffectByIdentifier(
    workflow.actor,
    "insightfulFighting"
  );
  let iTarget = false;
  if (insightfulFightingEffect && rollType != "disadvantage") {
    let effectTarget =
      insightfulFightingEffect.flags["chris-premades"]?.insightfulFighting
        ?.target;
    if (effectTarget === targetToken.document.uuid) {
      doSneak = true;
      iTarget = true;
    }
  }

  // If doSneak is still false, return
  if (!doSneak) {
    console.warn("Sneak attack conditions not met"); // Debugging statement
    return;
  }

  // Check for auto sneak attack configuration
  let autoSneak = itemUtils.getConfig(trigger.entity, "auto");
  if (!autoSneak) {
    let selection = await dialogUtils.confirm(
      trigger.entity.name,
      genericUtils
        .translate("CHRISPREMADES.Macros.SneakAttack.Use")
        .replace("{name}", trigger.entity.name)
    );
    if (!selection) return;
  }

  // Check for Rend Mind and Psionic Energy features
  let rendMind = itemUtils.getItemByIdentifier(workflow.actor, "rendMind");
  let psionicEnergy = itemUtils.getItemByIdentifier(
    workflow.actor,
    "psionicEnergy"
  );
  if (weaponIdentifier === "psychicBlades" && rendMind && psionicEnergy)
    await genericUtils.setFlag(
      workflow.item,
      "chris-premades",
      "rendMind.prompt",
      true
    );

  // Set the turn check for sneak attack
  await combatUtils.setTurnCheck(trigger.entity, "sneakAttack");

  let diceReduction = 0; // Define diceReduction at the beginning of the function
  let poisonChoice = {};
  if (workflow.actor.items.find((i) => i.name === "Poisoner's Kit")) {
    poisonChoice = {
      value: `poison`,
      label: `Poison`,
      die: `1d6`,
      number: 1,
      saveType: `con`,
      effect: `Poisoned`,
    };
  }
  const targetSize = targetToken.actor.system.traits.size;
  const sizeOrder = ["tiny", "sm", "med", "lg", "huge", "grg"];

  if (workflow.actor.items.find((i) => i.name === "Cunning Strike")) {
    // Define the strike options
    let strikeOptions = [
      {
        value: `disarm`,
        label: `Disarm`,
        die: `1d6`,
        number: 1,
        saveType: `dex`,
        effect: `Disarmed`,
      },
      // Only include poisonChoice if it's not an empty object
      ...(Object.keys(poisonChoice).length ? [poisonChoice] : []),
    ];
    // Check target size and add Trip option if applicable
    if (sizeOrder.indexOf(targetSize) <= sizeOrder.indexOf("lg")) {
      strikeOptions.push({
        value: `trip`,
        label: `Trip`,
        die: `1d6`,
        number: 1,
        saveType: `dex`,
        effect: `Prone`,
      });
    }
    strikeOptions.push({
      value: `withdraw`,
      label: `Withdraw`,
      die: `1d6`,
      number: 1,
      saveType: ``,
      effect: `Withdrawn`,
    });

    // Add additional strike options for higher rogue levels
    if (workflow.actor.items.find((i) => i.name === "Devious Strikes")) {
      strikeOptions.push({
        value: `daze`,
        label: `Daze`,
        die: `2d6`,
        number: 2,
        saveType: `con`,
        effect: `Dazed`,
      });
      strikeOptions.push({
        value: `knockout`,
        label: `Knock Out`,
        die: `6d6`,
        number: 6,
        saveType: `con`,
        effect: `Unconscious`,
      });
      strikeOptions.push({
        value: `obscure`,
        label: `Obscure`,
        die: `3d6`,
        number: 3,
        saveType: `dex`,
        effect: `Blinded`,
      });
    }
    // Select which attack to use
    let scale = workflow.actor.system.scale?.rogue?.["sneak-attack"];
    let diceReductionNames = ``;
    let saveType1 = ``;
    let saveType2 = ``;
    let title = "Select Cunning Strike Option";
    let content = `Pick a Cunning Strike to use or choose cancel to use normal Sneak Attack.`;

    let input = {
      label: "Select",
      name: "cunningStrike",
      options: {
        options: strikeOptions.map((option) => ({
          value: option.value,
          label: `${option.label} (-${option.die})`,
        })),
      },
    };
    // Show a dialog to select the cunning strike option

    let selection = await dialogUtils.selectDialog(title, content, input);

    // Find the selected option in the strikeOptions array
    let selectedOption = strikeOptions.find(
      (option) => option.value === selection
    );

    if (selectedOption) {
      diceReductionNames = selectedOption.label;
      diceReduction += selectedOption.number;
      saveType1 = selectedOption.saveType;
    }

    let strikeOptions2 = []; // Declare outside the if block
    let selection2; // Define selection2 variable

    if (
      workflow.actor.items.find((i) => i.name === "Improved Cunning Strike") &&
      selection != false
    ) {
      // Exclude the first choice from being made again accidentally
      for (let option of strikeOptions) {
        if (option.value === selection) {
          continue;
        }
        // Check if there would be negative dice if this second option is chosen
        if (scale.number - diceReduction < option.number) {
          continue;
        }
        strikeOptions2.push(option);
      }

      // Show the second dialog to select another cunning strike option
      if (strikeOptions2.length > 0) {
        selection2 = await dialogUtils.selectDialog(title, content, {
          label: "Select",
          name: "deviousStrikes",
          options: {
            options: strikeOptions2.map((option) => ({
              value: option.value,
              label: `${option.label} (-${option.die})`,
            })),
          },
        });
      }
    }

    // Find the selected option in the strikeOptions2 array
    let selectedOption2 = strikeOptions2.find(
      (option) => option.value === selection2
    );

    if (selectedOption2) {
      diceReductionNames += ` and ` + selectedOption2.label;
      diceReduction += selectedOption2.number;
      saveType2 = selectedOption2.saveType;
    }
    if (selectedOption) {
      if (
        selectedOption.label === `Withdraw` ||
        (selectedOption2 && selectedOption2.label === `Withdraw`)
      ) {
        let effectData = await workflow.actor.items
          .find((i) => i.name == `Sneak Attack Effects`)
          .effects.filter((e) => e.label.includes(`Withdraw`));
        await MidiQOL.socket().executeAsGM("createEffects", {
          actorUuid: workflow.actor.uuid,
          effects: effectData,
        });
      }
    }
    if (saveType1 != ``) {
      let item = await workflow.actor.items.find(
        (i) => i.name == `Sneak Attack Effects`
      );
      console.warn("item", item);
      const itemTemplateData = item.toObject();
      itemTemplateData.name = `Sneak Attack Effects (${selectedOption.label})`;
      itemTemplateData.system.save.ability = `${selectedOption.saveType}`;
      itemTemplateData.effects = await itemTemplateData.effects.filter((e) =>
        e.label.includes(`${selectedOption.effect}`)
      );
      let newSneakAttackEffects = new CONFIG.Item.documentClass(
        itemTemplateData,
        {
          parent: workflow.actor,
        }
      );
      console.warn("newSneakAttackEffects", newSneakAttackEffects);
      await MidiQOL.completeItemRoll(newSneakAttackEffects, {
        targetUuids: [targetToken.uuid ?? targetToken.document.uuid],
      });
    }
    if (saveType2 != ``) {
      let item = await workflow.actor.items.find(
        (i) => i.name == `Sneak Attack Effects`
      );
      const itemTemplateData = item.toObject();

      itemTemplateData.name = `Sneak Attack Effects (${selectedOption2.label})`;
      itemTemplateData.system.save.ability = `${selectedOption2.saveType}`;
      itemTemplateData.effects = await itemTemplateData.effects.filter((e) =>
        e.label.includes(`${selectedOption2.effect}`)
      );
      let newSneakAttackEffects = new CONFIG.Item.documentClass(
        itemTemplateData,
        {
          parent: workflow.actor,
        }
      );
      await MidiQOL.completeItemRoll(newSneakAttackEffects, {
        targetUuids: [targetToken.uuid ?? targetToken.document.uuid],
      });
    }
  }

  // Get the bonus damage formula
  let bonusDamageFormula = itemUtils.getConfig(trigger.entity, "formula");
  if (!bonusDamageFormula || bonusDamageFormula === "") {
    if (workflow.actor.type === "character") {
      let scale = workflow.actor.system.scale?.rogue?.["sneak-attack"];
      if (scale) {
        console.log("scale", scale);
        console.log("diceReduction", diceReduction);
        let number = scale.number - diceReduction;
        bonusDamageFormula =
          number + "d" + scale.faces + "[" + workflow.defaultDamageType + "]";
      } else {
        genericUtils.notify("CHRISPREMADES.Macros.SneakAttack.Scale", "warn");
        return;
      }
    } else if (workflow.actor.type === "npc") {
      let number = Math.ceil(workflow.actor.system.details.cr / 2);
      bonusDamageFormula = number + "d6[" + workflow.defaultDamageType + "]";
    }
  } else {
    bonusDamageFormula += "[" + workflow.defaultDamageType + "]";
  }

  // Check for Eye for Weakness feature
  let eyeFeature = itemUtils.getItemByIdentifier(
    workflow.actor,
    "eyeForWeakness"
  );
  if (iTarget && eyeFeature)
    bonusDamageFormula += " + 3d6[" + workflow.defaultDamageType + "]";

  // Apply the bonus damage
  await workflowUtils.bonusDamage(workflow, bonusDamageFormula, {
    damageType: workflow.defaultDamageType,
  });
  console.log("Bonus damage applied:", bonusDamageFormula); // Debugging statement

  // Use the trigger entity
  await trigger.entity.use();

  // Display Rakish Audacity if applicable
  if (displayRakish) await rakishAudacity.use();

  // Display Insightful Fighting and Eye for Weakness if applicable
  if (iTarget) {
    let feature = itemUtils.getItemByIdentifier(
      workflow.actor,
      "insightfulFighting"
    );
    if (feature) await feature.displayCard();
    if (eyeFeature) eyeFeature.use();
  }

  // Check if animation should be played
  let playAnimation = itemUtils.getConfig(trigger.entity, "playAnimation");
  if (!animationUtils.aseCheck() || animationUtils.jb2aCheck() != "patreon")
    playAnimation = false;
  if (!playAnimation) return;

  // Determine the animation type
  let animationType;
  if (tokenUtils.getDistance(workflow.token, targetToken) > 5)
    animationType = "ranged";
  if (!animationType) animationType = workflow.defaultDamageType;

  // Play the animation
  await animation(targetToken, workflow.token, animationType);
  console.log("Animation played with type:", animationType); // Debugging statement
}

/**
 * Function to handle the end of combat.
 * @param {Object} params - The parameters for the combat end function.
 * @param {Object} params.trigger - The trigger for the combat end function.
 */
async function combatEnd({ trigger }) {
  console.log("Combat end function called with:", { trigger }); // Debugging statement
  await combatUtils.setTurnCheck(trigger.entity, "sneakAttack", true);
}

// Export the sneak attack module
export let sneakAttack = {
  name: "Sneak Attack",
  version: "0.12.41",
  identifier: "sneakAttack",
  midi: {
    actor: [
      {
        pass: "damageRollComplete",
        macro: damage,
        priority: 215,
      },
    ],
  },
  combat: [
    {
      pass: "combatEnd",
      macro: combatEnd,
      priority: 50,
    },
  ],
  config: [
    {
      value: "playAnimation",
      label: "CHRISPREMADES.Config.PlayAnimation",
      type: "checkbox",
      default: true,
      category: "animation",
    },
    {
      value: "auto",
      label: "CHRISPREMADES.SneakAttack.Auto",
      type: "checkbox",
      default: false,
      category: "mechanics",
    },
  ],
};
