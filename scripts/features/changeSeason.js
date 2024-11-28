const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function rest({ trigger }) {
  if (itemUtils.getConfig(trigger.entity, 'restPrompt')) {
    console.log("Change Season: rest triggered");
    await trigger.entity.use();
  }
}

async function use({ workflow }) {

  // rethink this to be more generic
  let seasonWeapons = new Map();
  seasonWeapons.set('summer', 'glaive');
  seasonWeapons.set('winter', 'scythe');

  let currentSeason = workflow.item.flags['chris-premades']?.eladrin?.season;
  let buttons = [];
  // include conditional handling based on config
  if (itemUtils.getConfig(workflow.item, 'autumnSeason'))
    buttons.push(['CHRISPREMADES.Macros.ChangeSeason.Autumn', 'autumn', {image: 'icons/magic/nature/leaf-glow-maple-orange.webp'}]);
  if (itemUtils.getConfig(workflow.item, 'winterSeason'))
    buttons.push(['CHRISPREMADES.Macros.ChangeSeason.Winter', 'winter', {image: 'icons/magic/air/wind-weather-snow-gusts.webp'}]);
  if (itemUtils.getConfig(workflow.item, 'springSeason'))
    buttons.push(['CHRISPREMADES.Macros.ChangeSeason.Spring', 'spring', {image: 'icons/magic/nature/leaf-glow-triple-green.webp'}]);
  if (itemUtils.getConfig(workflow.item, 'summerSeason'))
    buttons.push(['CHRISPREMADES.Macros.ChangeSeason.Summer', 'summer', {image: 'icons/magic/nature/symbol-sun-yellow.webp'}]);
  if (!buttons.length) {
    console.log('No seasons configured!');
    return;
  }
  let currIdx = buttons.findIndex(i => i[1] === currentSeason);
  if (currIdx >= 0) buttons.splice(currIdx, 1);
  let season = await dialogUtils.buttonDialog(workflow.item.name, 'CHRISPREMADES.Macros.ChangeSeason.Select', buttons);
  if (!season) return;

  await genericUtils.update(workflow.actor.itemTypes.weapon.find(i => i.name.toLowerCase().search(seasonWeapons.get(currentSeason)) != -1), { "system.equipped": false });
  await genericUtils.update(workflow.actor.itemTypes.weapon.find(i => i.name.toLowerCase().search(seasonWeapons.get(season)) != -1), { "system.equipped": true });

  let currAvatar = itemUtils.getConfig(workflow.item, currentSeason + 'Avatar');
  let currToken = itemUtils.getConfig(workflow.item, currentSeason + 'Token');
  if (!currAvatar) await itemUtils.setConfig(workflow.item, currentSeason + 'Avatar', workflow.actor.img);
  if (!currToken) await itemUtils.setConfig(workflow.item, currentSeason + 'Token', workflow.token.document.texture.src);
  let updates = {
    actor: {},
    token: {}
  };
  let avatarImg = itemUtils.getConfig(workflow.item, season + 'Avatar');
  let tokenImg = itemUtils.getConfig(workflow.item, season + 'Token');
  if (avatarImg) {
    genericUtils.setProperty(updates.actor, 'img', avatarImg);
  }
  if (tokenImg) {
    genericUtils.setProperty(updates.actor, 'prototypeToken.texture.src', tokenImg);
    genericUtils.setProperty(updates.token, 'texture.src', tokenImg);
  }
  if (Object.entries(updates.actor)?.length) {
    await genericUtils.update(workflow.actor, updates.actor);
  }
  if (Object.entries(updates.token)?.length) {
    await genericUtils.update(workflow.token.document, updates.token);
  }
  await genericUtils.setFlag(workflow.item, 'chris-premades', 'eladrin.season', season);
}

export let changeSeason = {
  name: 'Change Season',
  identifier: 'changeSeason',
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
      value: 'restPrompt',
      label: 'Prompt for season change at long rest?',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: false,
      category: 'homebrew'
    },
    {
      value: 'autumnSeason',
      label: 'Include Autumn in season choices?',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: true,
      category: 'homebrew'
    },
    {
      value: 'winterSeason',
      label: 'Include Winter in season choices?',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: true,
      category: 'homebrew'
    },
    {
      value: 'springSeason',
      label: 'Include Spring in season choices?',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: true,
      category: 'homebrew'
    },
    {
      value: 'summerSeason',
      label: 'Include Summer in season choices?',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'checkbox',
      default: true,
      category: 'homebrew'
    },
    {
      value: 'autumnAvatar',
      label: 'CHRISPREMADES.Summons.CustomAvatar',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'autumnToken',
      label: 'CHRISPREMADES.Summons.CustomToken',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Autumn',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'winterAvatar',
      label: 'CHRISPREMADES.Summons.CustomAvatar',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Winter',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'winterToken',
      label: 'CHRISPREMADES.Summons.CustomToken',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Winter',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'springAvatar',
      label: 'CHRISPREMADES.Summons.CustomAvatar',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Spring',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'springToken',
      label: 'CHRISPREMADES.Summons.CustomToken',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Spring',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'summerAvatar',
      label: 'CHRISPREMADES.Summons.CustomAvatar',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Summer',
      type: 'file',
      default: '',
      category: 'visuals'
    },
    {
      value: 'summerToken',
      label: 'CHRISPREMADES.Summons.CustomToken',
      i18nOption: 'CHRISPREMADES.Macros.ChangeSeason.Summer',
      type: 'file',
      default: '',
      category: 'visuals'
    }
  ],
  rest: [
    {
      pass: 'long',
      macro: rest,
      priority: 50
    }
  ]
};