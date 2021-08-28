var diff = 0;
var date = Date.now();
var player
var tmp = {
    nan: 0,
    step: 1,
    ready: 0,
}

const LIQUIDS = {
    names: ['water', 'cobblestone', 'coal', 'copper', 'iron', 'gold', 'gemstone'],
    fulls: ['Water', 'Cobblestone', 'Coal', 'Copper', 'Iron', 'Gold', 'Gemstone'],
    fill(x) {
        let id = this.names[x]
        let filled = player.liquids[id].add(this.fills[id]())
        if (filled.gte(this.caps[id]())) player.liquids[id] = this.caps[id]()
        else player.liquids[id] = filled
    },
    drain(x) {
        let drain = this.drains[x] ? this.drains[x]() : E(0)
        let a = drain.sub(LIQUIDS.autoFills[x] ? (LIQUIDS.autoFills[x]() ? LIQUIDS.fills[x]().mul(1.5) : 0) : 0)
        if (tmp.res_spend) a = a.add(tmp.res_spend[x])
        return a
    },
    unls: {
        water() { return true },
        cobblestone() { return player.researches.includes(4) },
        coal() { return player.researches.includes(7) },
        raw_copper() { return player.researches.includes(12) },
        raw_iron() { return player.researches.includes(12) },
        copper() { return player.researches.includes(12) },
        iron() { return player.researches.includes(12) },
        gold() { return player.researches.includes(16) },
        gemstone() { return player.researches.includes(19) },
    },
    caps: {
        water() {
            let a = E(10).mul(UPGS.upgs[0].effect().buff).mul(GEMS.effects[1]())
            return a
        },
        cobblestone() {
            let a = E(10000).mul(UPGS.upgs[4].effect()).mul(GEMS.effects[1]())
            return a
        },
        coal() {
            let a = E(10000).mul(UPGS.upgs[5].effect()).mul(GEMS.effects[1]())
            if (player.researches.includes(14)) a = a.mul(UPGS.researches[14].effect())
            return a
        },
        copper() {
            let a = E(10000).mul(GEMS.effects[1]())
            if (player.researches.includes(14)) a = a.mul(UPGS.researches[14].effect())
            return a
        },
        iron() {
            let a = E(10000).mul(GEMS.effects[1]())
            if (player.researches.includes(14)) a = a.mul(UPGS.researches[14].effect())
            return a
        },
        gold() {
            let a = E(10000).mul(GEMS.effects[1]())
            return a
        },
        gemstone() {
            let a = E(10000).mul(GEMS.effects[1]())
            if (player.researches.includes(20)) a = a.mul(UPGS.researches[20].effect())
            return a
        },
    },
    drains: {
        water() {
            let a = E(1).mul(UPGS.upgs[0].effect().nerf).div(UPGS.upgs[1].effect())
            return a
        },
    },
    fills: {
        water() {
            let a = E(1).add(UPGS.upgs[2].effect()).mul(UPGS.upgs[3].effect()).mul(UPGS.upgs[8].effect())
            if (player.researches.includes(2)) a = a.mul(UPGS.researches[2].effect())
            if (player.researches.includes(6)) a = a.mul(10)
            if (player.researches.includes(13)) a = a.pow(1.25)
            return a.pow(GEMS.effects[3]())
        },
        cobblestone() {
            let a = E(10).mul(UPGS.upgs[8].effect())
            if (player.researches.includes(6)) a = a.mul(10)
            if (player.researches.includes(10)) a = a.mul(UPGS.researches[10].effect())
            return a.pow(GEMS.effects[3]())
        },
        coal() {
            let a = E(50).mul(UPGS.upgs[6].effect())
            return a.pow(GEMS.effects[3]())
        },
        copper() {
            let a = E(50)
            return a.pow(GEMS.effects[3]())
        },
        iron() {
            let a = E(50)
            return a.pow(GEMS.effects[3]())
        },
        gold() {
            let a = E(10)
            return a.pow(GEMS.effects[3]())
        },
        gemstone() {
            let a = E(10)
            return a.pow(GEMS.effects[3]())
        },
    },
    autoFills: {
        water() { return player.researches.includes(0) },
        cobblestone() { return player.researches.includes(10) },
        coal() { return false },
    },
}

const UPGS = {
    auto() {
        let a = []
        if (player.researches.includes(17)) a.push(0,1,2,3)
        if (player.researches.includes(21)) a.push(4,5,6,7,8)
        return a
    },
    can(type, x) {
        let data = this[type][x]
        for (let i = 0; i < data.res.length; i++) if (!this.canResource(data.res[i], data.cost()[i])) return false
        return true
    },
    canResource(res, cost) {
        return player.liquids[res].gte(cost)
    },
    noSpend() {
        let a = []
        if (player.researches.includes(8)) a.push(0,1,2)
        if (player.researches.includes(17)) a.push(3)
        return a
    },
    buy(type, x) {
        if (this.can(type, x) && (type == "researches" ? !player.researches.includes(x) : true)) {
            let data = this[type][x]
            if (type == 'upgs' ? !this.noSpend().includes(x) : true) for (let i = 0; i < data.res.length; i++) player.liquids[data.res[i]] = player.liquids[data.res[i]].sub(data.cost()[i].mul(type == 'upgs' ? GEMS.effects[2]() : 1))
            switch (type) {
                case 'upgs':
                    if (player.upgrades[x] === undefined) player.upgrades[x] = E(0)
                    player.upgrades[x] = player.upgrades[x].add(1)
                    break;
                case 'researches':
                    player.researches.push(x)
                    if (x == 22) TABS.choose(6)
                    break;
            }
        }
    },
    have(x) { return player.upgrades[x] !== undefined ? player.upgrades[x] : E(0) },
    upgs: [
        {
            id: 0,
            unl() { return true },
            title: "Water Capacity",
            desc: "Increase Water storage tank by 50%, but draining is increased by 50%",
            res: ['water'],
            cost(x=UPGS.have(this.id)) { return [E(1.5).pow(x).mul(7)] },
            effect(x=UPGS.have(this.id)) {
                let ret = {}
                ret.buff = E(1.5).pow(x)
                ret.nerf = E(1.5).pow(x)
                return ret
            },
        },{
            id: 1,
            unl() { return true },
            title: "Fixing Water",
            desc: "Draining water is decreased by 25%",
            res: ['water'],
            cost(x=UPGS.have(this.id)) { return [E(1.4).pow(x.pow(1.05).mul(player.researches.includes(17)?0.75:1)).mul(10)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.25).pow(x)
                return ret
            },
        },{
            id: 2,
            unl() { return true },
            title: "More Water",
            desc: "Increase Water filling by +0.5",
            res: ['water'],
            cost(x=UPGS.have(this.id)) { return [E(1.5).pow(x.mul(player.researches.includes(17)?0.75:1)).mul(10)] },
            effect(x=UPGS.have(this.id)) {
                let ret = x.mul(0.5)
                return ret
            },
        },{
            id: 3,
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Water Hole",
            desc: "Water fills 25% faster",
            res: ['water','cobblestone'],
            cost(x=UPGS.have(this.id)) { return [E(2).pow(x.mul(player.researches.includes(17)?0.75:1)).mul(1000),E(5/3).pow(x.mul(player.researches.includes(17)?0.75:1)).mul(100)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.25).pow(x)
                return ret
            },
        },{
            id: 4,
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Stone Capacity",
            desc: "Increase Cobblestone storage tank by 50%",
            res: ['cobblestone'],
            cost(x=UPGS.have(this.id)) { return [E(1.5).pow(x).mul(7000)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.5).pow(x)
                return ret
            },
        },{
            id: 5,
            unl() { return LIQUIDS.unls.coal() },
            title: "Coal Capacity",
            desc: "Increase Coal storage tank by 50%",
            res: ['coal'],
            cost(x=UPGS.have(this.id)) { return [E(1.5).pow(x).mul(7000)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.5).pow(x)
                return ret
            },
        },{
            id: 6,
            unl() { return LIQUIDS.unls.coal() },
            title: "More Coal",
            desc: "Coal fills 50% faster",
            res: ['water','cobblestone'],
            cost(x=UPGS.have(this.id)) { return [E(1.75).pow(x).mul(1e6),E(1.75).pow(x).mul(1e5)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.5).pow(x)
                return ret
            },
        },{
            id: 7,
            unl() { return LIQUIDS.unls.copper() },
            title: "Easy Energy",
            desc: "Increase energy outputs by 50%",
            res: ['copper','iron'],
            cost(x=UPGS.have(this.id)) { return [E(1.75).pow(x).mul(500),E(1.75).pow(x).mul(500)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(1.5).pow(x)
                return ret
            },
        },{
            id: 8,
            unl() { return LIQUIDS.unls.gold() },
            title: "Volume Strength",
            desc: "Increase all previous resources gain by 2x",
            res: ['gold'],
            cost(x=UPGS.have(this.id)) { return [E(2.25).pow(x).mul(100)] },
            effect(x=UPGS.have(this.id)) {
                let ret = E(2).pow(x)
                return ret
            },
        },
    ],
    researches: [
        {
            unl() { return true },
            title: "Auto-Water",
            desc: "Automatically fills water based on your filling water",
            res: ['water'],
            cost() { return [E(50)] },
        },{
            unl() { return true },
            title: "HydroPower",
            desc: "Unlock Hydro-Electric Power in Energy tab",
            res: ['water'],
            cost() { return [E(250)] },
        },{
            unl() { return player.researches.includes(1) },
            title: "Faster Filling",
            desc: "Water fills faster based on Energy",
            res: ['water'],
            cost() { return [E(500)] },
            effect() {
                let ret = player.energy.add(1).log10().add(1).pow(1.5)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return player.researches.includes(1) },
            title: "Two in One",
            desc: "Hydro-Electric Power products energy twice faster",
            res: ['water'],
            cost() { return [E(1500)] },
        },{
            unl() { return true },
            title: "Stone Era",
            desc: "Unlock Cobblestone",
            res: ['water'],
            cost() { return [E(5000)] },
        },{
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Addtional Water",
            desc: "Auto-Mine Stone products cobblestone faster based on water",
            res: ['water','cobblestone'],
            cost() { return [E(50000),E(2500)] },
            effect() {
                let ret = player.liquids.water.add(1).log10().add(1).pow(0.85)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Fast Filling I",
            desc: "Water & Cobblestone fills 10x faster",
            res: ['water','cobblestone'],
            cost() { return [E(1e5),E(10000)] },
        },{
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Gather Ore I",
            desc: "Unlock Coal",
            res: ['cobblestone'],
            cost() { return [E(50000)] },
        },{
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Free Water",
            desc: "Upgrades 1-3 no longer spent resources",
            res: ['water'],
            cost() { return [E(1e6)] },
        },{
            unl() { return LIQUIDS.unls.coal() },
            title: "Addtional Coal",
            desc: "Hydro-Electric Power products faster based on coal",
            res: ['cobblestone','coal'],
            cost() { return [E(5e4),E(1e4)] },
            effect() {
                let ret = player.liquids.coal.add(1).log10().add(1).pow(2)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return LIQUIDS.unls.cobblestone() },
            title: "Auto-Stone",
            desc: "Automatically fills cobblestone, and fills faster by cobblestone",
            res: ['cobblestone'],
            cost() { return [E(7.5e4)] },
            effect() {
                let ret = player.liquids.cobblestone.add(1).log10().add(1).pow(1.5)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return LIQUIDS.unls.coal() },
            title: "Doubled Coal",
            desc: "Heat Generator products 4x effective",
            res: ['coal'],
            cost() { return [E(2.5e4)] },
        },{
            unl() { return LIQUIDS.unls.coal() },
            title: "Gather Ore II",
            desc: "Unlock Copper & Iron",
            res: ['water','cobblestone','coal'],
            cost() { return [E(1e7),E(1e6),E(5e4)] },
        },{
            unl() { return LIQUIDS.unls.copper() },
            title: "Exponential Water",
            desc: "Filling Water is raised by 1.25",
            res: ['water','copper','iron'],
            cost() { return [E(5e7),E(1e4),E(1e4)] },
        },{
            unl() { return LIQUIDS.unls.copper() },
            title: "Own Storage",
            desc: "Coal, Copper & Iron capacities are increased based on water",
            res: ['water'],
            cost() { return [E(1e9)] },
            effect() {
                let ret = player.liquids.water.add(1).log10().add(1).pow(2)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return LIQUIDS.unls.copper() },
            title: "Iron Pickaxe",
            desc: "Coal, Copper & Iron boosts themselves from Auto-Gather I",
            res: ['coal','copper','iron'],
            cost() { return [E(1e5),E(2.5e4),E(2.5e4)] },
            effect() {
                let ret = {}
                ret.coal = player.liquids.coal.add(1).log10().add(1).pow(2)
                ret.copper = player.liquids.copper.add(1).log10().add(1)
                ret.iron = player.liquids.iron.add(1).log10().add(1)
                return ret
            },
            effDesc(x=this.effect()) { return format(x.coal)+"x to coal, "+format(x.copper)+"x to copper, "+format(x.iron)+"x to iron" },
        },{
            unl() { return LIQUIDS.unls.copper() },
            title: "Gold Era",
            desc: "Unlock Gold (rarest ore)",
            res: ['coal','copper','iron'],
            cost() { return [E(1e6),E(1e5),E(1e5)] },
        },{
            unl() { return LIQUIDS.unls.gold() },
            title: "Water Civilazation",
            desc: "Upgrades 2-4 are cheaper, Upgrade 4 no longer spent resources. You can automate Upgrade 1-4 if can afford",
            res: ['gold'],
            cost() { return [E(1.5e3)] },
        },{
            unl() { return LIQUIDS.unls.gold() },
            title: "Exponential Coal",
            desc: "Filling Coal is raised by 1.33",
            res: ['coal','gold'],
            cost() { return [E(5e7),E(5e3)] },
        },{
            unl() { return LIQUIDS.unls.gold() },
            title: "Gather Gemstone",
            desc: "Unlock Gemstone",
            res: ['water','cobblestone','coal','gold'],
            cost() { return [E(1e13),E(2.5e7),E(1e10),E(1e4)] },
        },{
            unl() { return LIQUIDS.unls.gemstone() },
            title: "Gemstone Booster",
            desc: "Gold boosts Gemstone production & capacity",
            res: ['gold', 'gemstone'],
            cost() { return [E(1e5),E(5e4)] },
            effect() {
                let ret = player.liquids.gold.add(1).log10().add(1).pow(2)
                return ret
            },
            effDesc(x=this.effect()) { return format(x)+"x" },
        },{
            unl() { return LIQUIDS.unls.gemstone() },
            title: "Mega Era",
            desc: "Automatically buy all upgrades if can afford. Gem requirement scales 10% weaker",
            res: ['gemstone'],
            cost() { return [E(5e8)] },
        },{
            unl() { return LIQUIDS.unls.gemstone() },
            title: "The End",
            desc: "Finish your Game...",
            res: ['gemstone'],
            cost() { return [E(1e53)] },
        },
    ],
}

const ENERGY = {
    isEnabled(x) { return player.energy_acts[this.types[x].id] },
    activate(x) { player.energy_acts[this.types[x].id] = !player.energy_acts[this.types[x].id] },
    canSpend(x) {
        let data = this.types[x]
        if (data.type == "output") for (let i = 0; i < data.spend_res.length; i++) if (player.liquids[data.spend_res[i]].lte(0)) return false
        if (data.type == "input") if (player.energy.lte(0)) return false
        return true
    },
    penalty() { return E(0.5) },
    types: [
        {
            id: "hydro_power",
            type: "output",
            title: "Hydro-Electric Power",
            desc: "Every time spending water increases energy",
            unl() { return player.researches.includes(1) },
            spend_res: ['water'],
            spend() { return [E(100)] },
            gain() { return E(5).add(UPGS.upgs[7].effect()).mul(player.researches.includes(3)?2:1).mul(player.researches.includes(9)?UPGS.researches[9].effect():1).mul(GEMS.effects[0]()).pow(GEMS.effects[3]()) },
        },{
            id: "auto_stone",
            type: "input",
            title: "Auto-Mine Stone",
            desc: "Every time spending energy products cobblestone",
            gain_res: ['cobblestone'],
            unl() { return LIQUIDS.unls.cobblestone() },
            spend() { return E(50) },
            gain() { return [E(100).mul(player.researches.includes(6)?10:1).mul(player.researches.includes(5)?UPGS.researches[5].effect():1).mul(GEMS.effects[0]()).pow(GEMS.effects[3]())] },
        },{
            id: "heat_generator",
            type: "output",
            title: "Heat Generator",
            desc: "Every time spending coal increases energy",
            unl() { return LIQUIDS.unls.coal() },
            spend_res: ['coal'],
            spend() { return [E(100)] },
            gain() { return E(50).add(UPGS.upgs[7].effect()).mul(player.researches.includes(11)?4:1).mul(GEMS.effects[0]()).pow(GEMS.effects[3]()) },
        },{
            id: "auto_gather_1",
            type: "input",
            title: "Auto-Gather I",
            desc: "Every time spending energy products coal, copper & iron",
            gain_res: ['coal','copper','iron'],
            unl() { return LIQUIDS.unls.copper() },
            spend() { return E(1e3) },
            gain() { return [E(200).mul(player.researches.includes(15)?UPGS.researches[15].effect().coal:1).mul(UPGS.upgs[8].effect()).pow(player.researches.includes(18)?4/3:1).mul(GEMS.effects[0]()).pow(GEMS.effects[3]()),
                E(100).mul(player.researches.includes(15)?UPGS.researches[15].effect().copper:1).mul(UPGS.upgs[8].effect()).mul(GEMS.effects[0]()).pow(GEMS.effects[3]()),
                E(100).mul(player.researches.includes(15)?UPGS.researches[15].effect().iron:1).mul(UPGS.upgs[8].effect()).mul(GEMS.effects[0]()).pow(GEMS.effects[3]())] },
        },{
            id: "auto_gather_2",
            type: "input",
            title: "Auto-Gather II",
            desc: "Every time spending energy products gold",
            gain_res: ['gold'],
            unl() { return LIQUIDS.unls.gold() },
            spend() { return E(5e4) },
            gain() { return [E(25).mul(GEMS.effects[0]()).pow(GEMS.effects[3]())] },
        },{
            id: "auto_gemstone",
            type: "input",
            title: "Auto-Gemstone",
            desc: "Every time spending energy products gemstone",
            gain_res: ['gemstone'],
            unl() { return LIQUIDS.unls.gemstone() },
            spend() { return E(2.5e5) },
            gain() { return [E(25).mul(GEMS.effects[0]()).pow(GEMS.effects[3]()).mul(player.researches.includes(20)?UPGS.researches[20].effect():1)] },
        },
    ],
}

function loop() {
    diff = Date.now()-date;
    calc(diff/1000);
    updateHTML()
    date = Date.now();
}

function format(ex, acc=4) {
    ex = E(ex)
    neg = ex.lt(0)?"-":""
    if (ex.mag == Infinity) return neg + 'Infinity'
    if (ex.lt(0)) ex = ex.mul(-1)
    if (ex.eq(0)) return ex.toFixed(acc)
    let e = ex.log10().floor()
    if (e.lt(4)) {
        return neg+ex.toFixed(Math.max(Math.min(acc-e.toNumber(), acc), 0))
    } else {
        let m = ex.div(E(10).pow(e))
        return neg+(e.log10().gte(9)?'':m.toFixed(4))+'e'+format(e, 0, "sc")
    }
}

function formatVolume(ex) {
    ex = E(ex)
    neg = ex.lt(0)?"-":""
    if (ex.lt(0)) ex = ex.mul(-1)
    if (ex.gte(1e3)) return neg + format(ex.div(1e3)) + " l"
    if (ex.gte(1)) return neg + format(ex) + " ml"
    return neg + format(ex.mul(1e3)) + " μl"
}

setInterval(loop, 50)