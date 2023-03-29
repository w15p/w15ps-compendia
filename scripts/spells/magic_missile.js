// extended from the magic missile sequencer example at https://wasp0r.itch.io/sequencer
/////

export class MagicMissile {
    static #magicMissileEffect(number, target) {
        return new Sequence()
        .effect()
            .atLocation(canvas.tokens.controlled[0])
            .stretchTo(canvas.tokens.get(target))
            .file("jb2a.magic_missile")
            .repeats(number, 300, 600)
            .randomizeMirrorY()
        .play();
    }

    static cast(onUseWorkflow, castLevel = onUseWorkflow.castData.castLevel) {
        let numTargets = onUseWorkflow.hitTargets.size;
        let numMissiles = 2 + castLevel;

        // TODO

        // this just works as the magic missiles are applied in targeting order
        //if (numMissiles < numTargets) return{}; //unnecessary

        let targetMissiles = new Map();
        // evenly distribute as many magic missiles as possible
        Array.from(onUseWorkflow.hitTargets).map(t => targetMissiles.set(t.id, Math.floor(numMissiles / numTargets)));
        // distribute the remaining magic missile in targeting order
        Array.from(onUseWorkflow.hitTargets).slice(0, numMissiles % numTargets).map(t => targetMissiles.set(t.id, targetMissiles.get(t.id)+1));

        // the fanciness
        targetMissiles.forEach((v, k) => this.#magicMissileEffect(v, k));

        // this is inelegant, but works
        onUseWorkflow.damageList.forEach(t => t.totalDamage = t.totalDamage * targetMissiles.get(t.tokenId));
        onUseWorkflow.damageList.forEach(t => t.appliedDamage = t.appliedDamage * targetMissiles.get(t.tokenId));
        onUseWorkflow.damageList.forEach(t => t.hpDamage = t.appliedDamage);
        onUseWorkflow.damageList.forEach(t => t.damageDetail[0][0].damage = t.damageDetail[0][0].damage * targetMissiles.get(t.tokenId));
        onUseWorkflow.damageList.forEach(t => t.newHP = t.oldHP - t.appliedDamage);
    }
}