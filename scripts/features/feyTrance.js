const { DialogApp, Crosshairs, Summons, Teleport, utils: { actorUtils, animationUtils, combatUtils, compendiumUtils, constants, crosshairUtils, dialogUtils, effectUtils, errors, genericUtils, itemUtils, rollUtils, socketUtils, templateUtils, tokenUtils, workflowUtils, spellUtils, regionUtils } } = chrisPremades;

async function rest({trigger}) {
    if (itemUtils.getConfig(trigger.entity, 'restPrompt')) {
        await trigger.entity.use();
    }
}

async function use({trigger, workflow}) {
    console.clear();
    console.log("Fey Trance");
    /*
    let prevProfs = Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) ?
        Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) :
        [];
*/
    const toolOptions = await dnd5e.documents.Trait.categories("tool");
    const weaponOptions = await dnd5e.documents.Trait.categories("weapon");

    let exclusions = new Set(['game', 'music', 'vehicle']);
    Object.keys(workflow.actor.system.tools).forEach(i => exclusions.add(i));
    Array.from(workflow.actor.system.traits.weaponProf.value).forEach(i => exclusions.add(i));
    /*
    let toolExclusions = new Set(['game', 'music', 'vehicle']);
    let weaponExclusions = new Set([]);

    Object.keys(workflow.actor.system.tools).forEach(i => toolExclusions.add(i));
    Array.from(workflow.actor.system.traits.weaponProf.value).forEach(i => weaponExclusions.add(i));
    */

    // working as a select
    /*
    let weaponToolInput = [
        'selectOption',
        [{
            label: '',
            name: 'weaponToolSelected',
            options: {
                options: Object.entries(toolOptions)
                .concat(Object.entries(weaponOptions))
                .filter(n => !exclusions.has(n[0])) // exclude top-level and categories
                .flatMap(i => {
                    if (i[1].children) {
                        return Object.entries(i[1].children)
                            .map(j => ({value: j[0], label: j[1].label}));//, options: {isChecked: prevProfs.includes(j.name)}}));
            }
            return {value: i[0], label: i[1].label};    
        }).filter(n => !exclusions.has(n.value)) // exclude children
            }}]];
*/

    /*
    let tranceChoice = await DialogApp.dialog(workflow.item.name, 'Choose 2 tool or weapon proficiencies:', 
        [weaponToolInput, weaponToolInput], 'okCancel', 
        {id: 'feyTrance'});//, height: 800});
        */








    let weaponToolInput = 
      Object.entries(toolOptions)
              .concat(Object.entries(weaponOptions))
              .filter(n => !exclusions.has(n[0])) // exclude top-level and categories
              .flatMap(i => {
                  if (i[1].children) {
                      return Object.entries(i[1].children)
                          .map(j => ({name: j[0], label: j[1].label}));//, options: {isChecked: prevProfs.includes(j.name)}}));
          }
          return {name: i[0], label: i[1].label};    
      }).filter(n => !exclusions.has(n.value)) // exclude children
          ;
/*
    let toolInput = Object.entries(toolOptions)
                        .filter(n => !toolExclusions.has(n[0])) // exclude top-level and categories
                        .flatMap(i => {
                            if (i[1].children) {
                                return Object.entries(i[1].children)
                                    .map(j => ({value: j[0], label: j[1].label, options: {isChecked: oldSettings.includes(j.name)}}));
                            }
                            return {value: i[0], label: i[1].label};    
                        }).filter(n => !toolExclusions.has(n.value)) // exclude children

    let weaponInput = Object.entries(weaponOptions)
                        .filter(n => !weaponExclusions.has(n[0])) // exclude top-level and categories
                        .flatMap(i => {
                            if (i[1].children) {
                                return Object.entries(i[1].children)
                                    .map(j => ({value: j[0], label: j[1].label}));
                            }
                            return {value: i[0], label: i[1].label};    
                        }).filter(n => !weaponExclusions.has(n.value)) // exclude children
    */
    //console.log(weaponToolInput);

    let tranceChoice = await DialogApp.dialog(workflow.item.name, 'Choose 2 tool or weapon proficiencies:', 
        [['checkbox', weaponToolInput, {totalMax: 2, displayAsRows: true}]], 'okCancel', 
        {id: 'feyTrance', height: 800})
    console.log(workflow, tranceChoice);
    if (!tranceChoice.buttons) return;
    let choices = Object.entries(tranceChoice).filter(e => e.key !== 'buttons').filter(e => e.value === true);
    console.log(choices);
}







export let feyTrance = {
    name: 'Trance',
    identifier: 'feyTrance',
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

    /*

    const toolOptions = await dnd5e.documents.Trait.categories("tool");
    const weaponOptions = await dnd5e.documents.Trait.categories("weapon");

    let toolExclusions = new Set(['game', 'music', 'vehicle']);
    let weaponExclusions = new Set([]);
    */
    /*
weaponType to weapon proficiencyMapping:
CONFIG.DND5E.weaponProficienciesMap

actor weapon proficiencies:
workflow.actor.system.traits.weaponProf

weapon type:
weapon(item).system.type.value

weapon list:
let weapons = Object.keys(CONFIG.DND5E.weaponIds);
*/

    //let prevProfs = Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) ?
    //    Object.keys(workflow.actor.system.tools).find(f => f.flags['chris-premades']?.feyTrance) :
    //    [];

    //prevProfs.forEach(i => await i.delete()); // currently broken - fix once flags are in place
    

    // this doesn't seem to be finding tool proficiencies, maybe use the above
    //let prevProfs = workflow.actor.items.find(i => i.flags['chris-premades']?.feyTrance);
    //if (prevProfs) prevProfs.forEach(i => await i.delete()); // remove previously chosen proficiencies

    // remove current proficiencies flagged with chrispremades
    // add the actors existing tool proficiencies to the exclusions
    // as there doesn't seem to be a way to show selected and disabled



/*
    let nonProfSkills = Object.entries(CONFIG.DND5E.skills).filter(([key, _]) => workflow.actor.system.skills[key].value < 1);
    let skillInput = [
        'selectOption',
        [{
            label: 'DND5E.TraitSkillsPlural.one',
            name: 'skillSelected',
            options: {
                options: nonProfSkills.map(([value, {label}]) => ({value, label}))
            }
        }]
    ];
    let weaponToolInput = [
        'selectOption',
        [{
            label: 'CHRISPREMADES.Macros.AstralTrance.WeapToolProf',
            name: 'weapToolSelected',
            options: {
                options: Object.keys(CONFIG.DND5E.weaponIds).map(i => ({value: i, label: i.capitalize()})).concat(Object.keys(tools).map(i => ({value: i, label: tools[i]})))
            }
        }]
    ];
    let selection = await DialogApp.dialog(workflow.item.name, 'CHRISPREMADES.Macros.AstralTrance.Which', [skillInput, weaponToolInput], 'okCancel');
*/

/*
    let toolChoices = Object.entries(toolOptions)
                        .filter(n => !toolExclusions.has(n[0])) // exclude top-level and categories
                        .flatMap(i => {
                            if (i[1].children) {
                                return Object.entries(i[1].children)
                                    .map(j => ({value: j[0], label: j[1].label, options: {isChecked: oldSettings.includes(j.name)}}));
                            }
                            return {value: i[0], label: i[1].label};    
                        }).filter(n => !toolExclusions.has(n.value)) // exclude children

    let weaponChoices = Object.entries(weaponOptions)
                        .filter(n => !weaponExclusions.has(n[0])) // exclude top-level and categories
                        .flatMap(i => {
                            if (i[1].children) {
                                return Object.entries(i[1].children)
                                    .map(j => ({value: j[0], label: j[1].label}));
                            }
                            return {value: i[0], label: i[1].label};    
                        }).filter(n => !weaponExclusions.has(n.value)) // exclude children
*/
    //let tranceChoice = await checkboxDialog(workflow.item.name, 'CHRISPREMADES.Macros.FeyTrance.Select', input);
    //let tranceChoice = await checkboxDialog(workflow.item.name, 'Choose 2 tool or weapon proficiencies:', input);
    //let tranceChoice = await DialogApp.dialog(workflow.item.name, 'Choose 2 tool or weapon proficiencies:', toolInput.concat(weaponInput), 'okCancel');

    

    //let inputs = packs.filter(j => !Object.values(constants.featurePacks).includes(j.metadata.id)).map(i => ({label: i.metadata.label, name: i.metadata.id.replaceAll('.', '|PERIOD|'), options: {isChecked: oldSettings.includes(i.metadata.id)}}));

    //let selection = await DialogApp.dialog('CHRISPREMADES.Settings.hiddenCompendiums.Name', 'CHRISPREMADES.Settings.hiddenCompendiums.Hint', [['checkbox', inputs, {displayAsRows: true}]], 'okCancel', {id: 'cpr-hidden-compendiums',height: 800});