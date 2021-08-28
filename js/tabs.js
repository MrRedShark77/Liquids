const TABS = {
    choose(x, stab=false) {
        if (stab) player.stab[player.tab] = x
        else player.tab = x
    },
    1: [
        {title: "Tank Storages", unl() { return !player.researches.includes(22) }},
        {title: "Upgrades", unl() { return !player.researches.includes(22) }},
        {title: "Researches", unl() { return !player.researches.includes(22) }},
        {title: "Options", unl() { return !player.researches.includes(22) }},
        {title: "Energy", unl() { return player.researches.includes(1) && !player.researches.includes(22) }},
        {title: "Gemstone", unl() { return player.researches.includes(19) && !player.researches.includes(22) }},
        {title: "undefined", unl() { return player.researches.includes(22) }},
    ],
    2: {
        
    },
}