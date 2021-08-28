function setupHTML() {
	let tabs_div = new Element("tabs_div")
	let stabs_div = new Element("stabs_div")
	let table = ""
	let table2 = ""
	for (let x = 0; x < TABS[1].length; x++) {
		table += `<button id="btn_tab${x}" class="btn_tab" onclick="TABS.choose(${x})">${TABS[1][x].title}</button>`

		if (TABS[2][x] !== undefined) {
			table2 += `<div id="stabs${x}_div">`
			for (let y = 0; y < TABS[2][x].length; y++) {
				table2 += `<button id="btn_stab${x}_${y}" class="btn_tab" onclick="TABS.choose(${y}, true)">${TABS[2][x][y].title}</button>`
			}
			table2 += `</div>`
		}
	}
	tabs_div.setHTML(table)
	stabs_div.setHTML(table2)

	let liquid_table = new Element('liquid_table')
	table = ""
	for (let x = 0; x < LIQUIDS.names.length; x++) {
		table += 
		`<div id="${LIQUIDS.names[x]}_div" class="liquid"><span class="liquid_name">${LIQUIDS.fulls[x]}</span><br><br>
			<div class="liquid_cap">
				<div class="liquid_volume ${LIQUIDS.names[x]}" id="${LIQUIDS.names[x]}_cap"></div>
			</div><br>
			<span id="${LIQUIDS.names[x]}_volume"></span><br><br>
			<button class="liquid_btn" onclick="LIQUIDS.fill(${x})">Fill +<span id="${LIQUIDS.names[x]}_fill"></span></button>
		</div>`
	}
	liquid_table.setHTML(table)

	let upgs_table = new Element('upgs_table')
	table = ""
	for (let x = 0; x < UPGS.upgs.length; x++) {
		let data = UPGS.upgs[x]
		let res = data.res
		let txt = []
		for (let i = 0; i < res.length; i++) txt.push(`<span id="upg${x}cost${i}">X</span> <div class="square ${res[i]}" tooltip="Volume of ${LIQUIDS.fulls[LIQUIDS.names.indexOf(res[i])]}"></div>`)
		table +=
		`<div id="upgrade${x}" class="upgrade">
			<div class="desc">
				<h3>${x+1}. ${data.title} (<span id="upg${x}lvl"></span>)</h3><br>
				${data.desc}<br>
				Cost: ${txt.join(", ")}
			</div><button onclick="UPGS.buy('upgs', ${x})">
				Purchase
			</button>
		</div>`
	}
	upgs_table.setHTML(table)

	let researches_table = new Element('researches_table')
	table = ""
	for (let x = 0; x < UPGS.researches.length; x++) {
		let data = UPGS.researches[x]
		let res = data.res
		let txt = []
		for (let i = 0; i < res.length; i++) txt.push(`<span id="res${x}cost${i}">X</span> <div class="square ${res[i]}" tooltip="Volume of ${LIQUIDS.fulls[LIQUIDS.names.indexOf(res[i])]}"></div>`)
		table +=
		`<div id="research${x}" class="upgrade">
			<div class="desc">
				<h3>${x+1}. ${data.title}</h3><br>
				${data.desc} ${data.effDesc ? `(<span id="res${x}eff"></span>)` : ""}
				<div id="res${x}cost_div" style="text-align: left">Cost: ${txt.join(", ")}</div>
			</div><button id="res${x}bought" onclick="UPGS.buy('researches', ${x})">
				Purchase
			</button>
		</div>`
	}
	researches_table.setHTML(table)

	let energy_table = new Element('energy_table')
	table = ""
	for (let x = 0; x < ENERGY.types.length; x++) {
		let data = ENERGY.types[x]
		let ret = ``
		let txt = []
		if (data.type == "output") {
			let res = data.spend_res
			for (let i = 0; i < res.length; i++) txt.push(`<span id="energy${x}spend${i}">X</span> <div class="square ${res[i]}" tooltip="Volume of ${LIQUIDS.fulls[LIQUIDS.names.indexOf(res[i])]}"></div>/s`)
			ret = `Spending ${txt.join(", ")} to gain <span class="energy" id="energy${x}gain">X</span> kWs/s`
		}
		if (data.type == "input") {
			let res = data.gain_res
			for (let i = 0; i < res.length; i++) txt.push(`<span id="energy${x}spend${i}">X</span> <div class="square ${res[i]}" tooltip="Volume of ${LIQUIDS.fulls[LIQUIDS.names.indexOf(res[i])]}"></div>/s`)
			ret = `Spending <span class="energy" id="energy${x}gain">X</span> kWs/s to gain ${txt.join(", ")}`
		}
		table +=
		`<div id="energy_div${x}" class="upgrade">
			<div class="desc">
				<h3>${x+1}. ${data.title} (<span id="energy${x}active">Disabled</span>)</h3><br>
				${data.desc}<br>
				${ret}
			</div><button id="energy${x}btn" onclick="ENERGY.activate(${x})">
				Enable
			</button>
		</div>`
	}
	energy_table.setHTML(table)

	let gemstone_table = new Element('gemstone_table')
	table = ""
	for (let x = 0; x < GEMS.fullNames.length; x++) {
		table += 
		`<div style="width: 30%; margin: 15px;">
			<button onclick="GEMS.insert(${x})"><h3>Insert 1</h3></button>
			<div class="table_center" style="align-items: center; height: 60px"><img src="images/${GEMS.fullNames[x]}Gem.png"><div>x<h2 id="gem${x}amount"></h2> <h3>${GEMS.fullNames[x]}</h3></div></div><br>
			<div id="gem${x}desc"></div>
		</div>`
	}
	gemstone_table.setHTML(table)

	tmp.el = {}
	let all = document.getElementsByTagName("*")
	for (let i=0;i<all.length;i++) {
		let x = all[i]
		tmp.el[x.id] = new Element(x)
	}
}

function updateTabsHTML() {
	for (let x = 0; x < TABS[1].length; x++) {
		tmp.el["btn_tab"+x].setDisplay(TABS[1][x].unl ? TABS[1][x].unl() : true)
		tmp.el["btn_tab"+x].setClasses({btn_tab: true, choosed: player.tab == x})

		if (tmp.el["tab_div"+x] !== undefined) tmp.el["tab_div"+x].setDisplay(player.tab == x)

		if (TABS[2][x] !== undefined) {
			tmp.el["stabs"+x+"_div"].setDisplay(player.tab == x)

			if (player.tab == x) for (let y = 0; y < TABS[2][x].length; y++) {
				tmp.el["btn_stab"+x+"_"+y].setDisplay(TABS[2][x][y].unl ? TABS[2][x][y].unl() : true)
				tmp.el["btn_stab"+x+"_"+y].setClasses({btn_tab: true, choosed: player.stab[x] == y})
			}
		}
	}
}

function updateLiquidsHTML() {
	if (player.tab != 0) return
	for (let x = 0; x < LIQUIDS.names.length; x++) {
		let id = LIQUIDS.names[x]
		tmp.el[id+"_div"].setDisplay(LIQUIDS.unls[id]())
		if (LIQUIDS.unls[id]()) {
			tmp.el[id+"_volume"].setHTML(formatVolume(player.liquids[id])+" / "+formatVolume(LIQUIDS.caps[id]())+"<br>("+formatVolume(LIQUIDS.drain(id).neg())+"/s)")
			tmp.el[id+"_fill"].setTxt(formatVolume(LIQUIDS.fills[id]()))
			let percentage = LIQUIDS.caps[id]().gte(1e10) ? player.liquids[id].add(1).log10().div(LIQUIDS.caps[id]().add(1).log10()).mul(100).max(0).min(100).toString() : player.liquids[id].div(LIQUIDS.caps[id]()).mul(100).max(0).min(100).toString()
			tmp.el[id+"_cap"].changeStyle("height", percentage+"%")
		}
	}
}

function updateUpgradesHTML() {
	if (player.tab != 1) return
	for (let x = 0; x < UPGS.upgs.length; x++) {
		let data = UPGS.upgs[x]
		tmp.el["upgrade"+x].setDisplay(data.unl())
		if (data.unl()) {
			tmp.el["upg"+x+"lvl"].setTxt(format(UPGS.have(x),0))
			let res = data.res
			for (let i = 0; i < res.length; i++) {
				tmp.el["upg"+x+"cost"+i].changeStyle("color", UPGS.canResource(res[i], data.cost()[i]) ? "white" : "#FF1616")
				tmp.el["upg"+x+"cost"+i].setTxt(formatVolume(data.cost()[i]))
			}
		}
	}
}

function updateResearchesHTML() {
	if (player.tab != 2) return
	tmp.el.optionRes.setTxt(["OFF", "ON", "No display effect only"][player.options.hideRes])
	for (let x = 0; x < UPGS.researches.length; x++) {
		let data = UPGS.researches[x]
		let dis = data.unl()
		if (player.options.hideRes > 0 && player.researches.includes(x) && (player.options.hideRes == 2 ? !tmp.el["res"+x+"eff"] : true)) dis = false
		tmp.el["research"+x].setDisplay(dis)
		if (dis) {
			let bought = player.researches.includes(x)
			if (tmp.el["res"+x+"eff"]) tmp.el["res"+x+"eff"].setHTML(data.effDesc())
			tmp.el["res"+x+"bought"].setTxt(bought ? "Bought" : "Purchase")
			tmp.el["res"+x+"cost_div"].changeStyle("visibility", bought ? "hidden" : "visible")
			if (!bought) {
				let res = data.res
				for (let i = 0; i < res.length; i++) {
					tmp.el["res"+x+"cost"+i].changeStyle("color", UPGS.canResource(res[i], data.cost()[i]) ? "white" : "#FF1616")
					tmp.el["res"+x+"cost"+i].setTxt(formatVolume(data.cost()[i]))
				}
			}
		}
	}
}

function updateEnergyHTML() {
	if (player.tab != 4) return
	tmp.el.energyAmount.setTxt(format(player.energy))
	tmp.el.energyGain.setTxt(format(tmp.energy_gain))
	for (let x = 0; x < ENERGY.types.length; x++) {
		let data = ENERGY.types[x]
		tmp.el["energy_div"+x].setDisplay(data.unl())
		if (data.unl()) {
			let active = ENERGY.isEnabled(x)
			tmp.el["energy"+x+"active"].setTxt(active ? "Enabled" : "Disabled")
			tmp.el["energy"+x+"btn"].setTxt(active ? "Disable" : "Enable")
			if (data.type == "output") {
				tmp.el["energy"+x+"gain"].setTxt(format(data.gain()))
				let res = data.spend_res
				for (let i = 0; i < res.length; i++) {
					tmp.el["energy"+x+"spend"+i].setTxt(formatVolume(data.spend()[i]))
				}
			}
			if (data.type == "input") {
				tmp.el["energy"+x+"gain"].setTxt(format(data.spend()))
				let res = data.gain_res
				for (let i = 0; i < res.length; i++) {
					tmp.el["energy"+x+"spend"+i].setTxt(formatVolume(data.gain()[i]))
				}
			}
		}
	}
}

function updateGemstoneHTML() {
	if (player.tab != 5) return
	tmp.el.gemstoneAmount.setTxt(formatVolume(player.liquids.gemstone))
	tmp.el.gemsTotal.setTxt(format(player.totalGems,0))
	tmp.el.gemsAmount.setTxt(format(GEMS.getUnspent(),0))
	tmp.el.gemsConvert.setTxt(format(GEMS.bulk().sub(player.totalGems).max(0).floor(),0))
	for (let x = 0; x < GEMS.fullNames.length; x++) {
		tmp.el['gem'+x+'amount'].setTxt(format(player.gems[x],1))
		tmp.el['gem'+x+'desc'].setHTML(GEMS.effDesc[x]())
	}
}

function updateEndHTML() {
	tmp.el.screen_white.setDisplay(player.researches.includes(22) && tmp.nan < 6)
	tmp.el.screen_white.changeStyle('opacity', (3-Math.min(Math.max(tmp.nan-3,0),3))/3*100+"%")
	if (player.tab != 6) return
	tmp.el.subDesc.setHTML(END.desc[tmp.step])
	tmp.el.next_btn.setHTML(END.btn[tmp.step])
}

function updateHTML() {
	tmp.el.loading.setDisplay(tmp.ready < 3)
    tmp.el.app.setDisplay(tmp.ready >= 3)
	updateEndHTML()
    updateTabsHTML()
	updateLiquidsHTML()
	updateUpgradesHTML()
	updateResearchesHTML()
	updateEnergyHTML()
	updateGemstoneHTML()
}