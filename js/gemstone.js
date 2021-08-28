const GEMS = {
    fullNames: ['Ruby', 'Sapphire', 'Emerald', 'Topaz', "Amethyst", 'Diamond'],
    req(x=player.totalGems) {
        let a = E(1.1).pow(x.softcap(100,4/3,0).pow(player.researches.includes(21)?1.45:1.5).div(GEMS.effects[4]())).mul(100)
        return a
    },
    bulk() {
        if (player.liquids.gemstone.lt(100)) return E(0)
        let a = player.liquids.gemstone.div(100).log(1.1).mul(GEMS.effects[4]()).root(player.researches.includes(21)?1.45:1.5).add(1).softcap(100,0.75,0).floor()
        return a
    },
    canConvert() { return this.bulk().gt(player.totalGems) },
    convert() {
        if (this.canConvert()) {
            player.totalGems = this.bulk()
            player.liquids.gemstone = player.liquids.gemstone.sub(this.req(this.bulk().sub(1)))
        }
    },
    getUnspent() {
        let a = player.totalGems
        for (let x = 0; x < this.fullNames.length; x++) a = a.sub(player.gems[x])
        return a.max(0)
    },
    insert(x) {
        if (this.getUnspent().gt(0)) {
            player.gems[x] = player.gems[x].add(this.getUnspent().min(1))
        }
    },
    dis() {
        if (this.getUnspent().gt(0)) {
            let a = this.getUnspent().div(6)
            for (let x = 0; x < this.fullNames.length; x++) player.gems[x] = player.gems[x].add(a)
        }
    },
    respec() {
        if (confirm("Are you really reset Gems to get Gems back? Reseting gems will reset resources & energy!")) {
            player.gems = [E(0),E(0),E(0),E(0),E(0),E(0)]
            for (let x = 0; x < LIQUIDS.names.length; x++) player.liquids[LIQUIDS.names[x]] = E(0)
            player.energy = E(0)
        }
    },
    effects: [
        (x=player.gems[0].mul(GEMS.effects[5]())) => {
            let a = E(1.5).pow(x)
            return a
        },(x=player.gems[1].mul(GEMS.effects[5]())) => {
            let a = E(1.5).pow(x)
            return a
        },(x=player.gems[2].mul(GEMS.effects[5]())) => {
            let a = E(0.9).pow(x.root(1.5))
            return a
        },(x=player.gems[3].mul(GEMS.effects[5]())) => {
            let a = E(0.01).mul(x.root(4/3)).add(1)
            return a
        },(x=player.gems[4].softcap(50,0.5,0).pow(GEMS.effects[5]())) => {
            let a = x.add(1).log10().add(1).root(4/3)
            return a
        },(x=player.gems[5].softcap(50,0.5,0)) => {
            let a = x.add(1).root(3)
            return a
        },
    ],
    effDesc: [
        () => {
            let eff = GEMS.effects[0]()
            return `Make production speed is <h3>${format(eff)}x</h3> faster`
        },() => {
            let eff = GEMS.effects[1]()
            return `Increase all capacities by <h3>${format(eff)}x</h3>`
        },() => {
            let eff = GEMS.effects[2]()
            return `Upgrades buys <h3>${format(eff.mul(100))}%</h3> of resources if can afford`
        },() => {
            let eff = GEMS.effects[3]()
            return `Increase filling exponent by <h3>${format(eff)}x</h3>`
        },() => {
            let eff = GEMS.effects[4]()
            return `Gems requirement scales <h3>${format(E(1).sub(eff.root(-1)).mul(100))}%</h3> weaker`
        },() => {
            let eff = GEMS.effects[5]()
            return `All previous gems are <h3>${format(eff)}x</h3> stronger`
        },
    ],
}