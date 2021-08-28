function E(x){return new Decimal(x)};

Decimal.prototype.softcap = function (start, power, mode) {
    var x = this.clone()
    if (x.gte(start)) {
        if ([0, "pow"].includes(mode)) x = x.div(start).pow(power).mul(start)
        if ([1, "mul"].includes(mode)) x = x.sub(start).div(power).add(start)
    }
    return x
}

function calc(dt) {
    if (tmp.res_spend === undefined) tmp.res_spend = {}
    tmp.energy_gain = E(0).sub(ENERGY.penalty())
    for (let x = 0; x < LIQUIDS.names.length; x++) tmp.res_spend[LIQUIDS.names[x]] = E(0)
    for (let i = 0; i < ENERGY.types.length; i++) {
        let data = ENERGY.types[i]
        if (player.energy_acts[data.id]) {
            if (data.type == "output") {
                let res = data.spend_res
                for (let j = 0; j < res.length; j++) {
                    tmp.res_spend[res[j]] = tmp.res_spend[res[j]].add(data.spend()[j])
                }
                if (ENERGY.canSpend(i)) tmp.energy_gain = tmp.energy_gain.add(data.gain())
            }
            if (data.type == "input") {
                let res = data.gain_res
                tmp.energy_gain = tmp.energy_gain.sub(data.spend())
                if (ENERGY.canSpend(i)) for (let j = 0; j < res.length; j++) {
                    tmp.res_spend[res[j]] = tmp.res_spend[res[j]].sub(data.gain()[j])
                }
            }
        }
    }
    player.energy = player.energy.add(tmp.energy_gain.mul(dt)).max(0)
    for (let x = 0; x < LIQUIDS.names.length; x++) {
        let id = LIQUIDS.names[x];
        if (LIQUIDS.unls[id]()) {
            player.liquids[id] = player.liquids[id].sub(LIQUIDS.drain(id).mul(dt)).max(0).min(LIQUIDS.caps[id]())
        }
    }
    let auto = UPGS.auto()
    for (let x = 0; x < auto.length; x++) UPGS.buy("upgs",auto[x])
    if (player.researches.includes(22)) tmp.nan += dt
    tmp.ready += dt
}

function getPlayerData() {
    let data = {
        tab: 0,
        stab: {},
        liquids: {},
        upgrades: {},
        researches: [],
        options: {
            hideRes: 0,
        },
        energy: E(0),
        energy_acts: {},
        gems: [E(0),E(0),E(0),E(0),E(0),E(0)],
        totalGems: E(0),
    }
    for (let x = 0; x < LIQUIDS.names.length; x++) data.liquids[LIQUIDS.names[x]] = E(0)
    for (let x = 0; x < TABS[1].length; x++) data.stab[x] = 0
    for (let x = 0; x < ENERGY.types.length; x++) data.energy_acts[ENERGY.types[x].id] = false
    return data
}

function wipe() {
    player = getPlayerData()
}

function loadPlayer(load) {
    player = Object.assign(getPlayerData(), load)
    convertStringToDecimal()
    
    player.tab = 0
    for (let x = 0; x < TABS[1].length; x++) player.stab[x] = 0
}

function convertStringToDecimal() {
    for (let x = 0; x < LIQUIDS.names.length; x++) player.liquids[LIQUIDS.names[x]] = E(player.liquids[LIQUIDS.names[x]])
    for (let x = 0; x < UPGS.upgs.length; x++) if (player.upgrades[x] !== undefined) player.upgrades[x] = E(player.upgrades[x])
    for (let x = 0; x < getPlayerData().gems.length; x++) player.gems[x] = E(player.gems[x])
    player.energy = E(player.energy)
    player.totalGems = E(player.totalGems)
}

function save(){
    if (player.researches.includes(22)) return
    if (localStorage.getItem("liquidsSave") == '') wipe()
    localStorage.setItem("liquidsSave",btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    save();
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Liquids Save.txt"
    a.click()
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
    if (loadgame != null) {
        load(loadgame)
        location.reload()
    }
}

function loadGame() {
    wipe()
    load(localStorage.getItem("liquidsSave"))
    setupHTML()
    updateHTML()
    setInterval(save,1000)
}