const classList = document.querySelector("#classDropdown")
const levels = document.querySelector("#levelDropdown")
const classDescript = document.querySelector("#classDescription")
const classForm = document.querySelector("#classForm")
const classSpellList = document.querySelector("#classSpellList")
const classSpells = document.querySelector("#classSpells")
const profList = document.querySelector("#profList")
const equipList = document.querySelector("#equipList")
const equip = document.querySelector("#classEquip")
const spellDescript = document.querySelector("#spellDescript")
const spellCard = document.querySelector("#spellCard")
const damage = document.querySelector("#damage")

async function getClasses(){
    const response = await fetch ("https://www.dnd5eapi.co/api/classes")
    const classData = await response.json()
    const classes = classData.results
    return classes
}

const addClasses = async() => {
    const data = await getClasses()
    data.forEach(characterClass => {
        const className = characterClass.name
        const classNameOption = document.createElement("OPTION")
        classList.appendChild(classNameOption).text = className
        classNameOption.value = `${className}`
    })
}

let spellObj = {}
let excludedItems = ["index", "url", "classes", "subclasses"]

const extractObjInfo = (obj, parent) => {
    const infoObj = Object.entries(obj)
    infoObj.forEach(entry => {
        if (!excludedItems.includes(entry[0])){
            if (typeof entry[1] === "object"){
                const ul = document.createElement("ul")
                parent.appendChild(ul).innerText = entry[0]
                extractObjInfo(entry[1], ul)
            } else {
                const li = document.createElement("li")
                li.innerText = `${entry[0]}: ${entry[1]}`
                parent.appendChild(li)
            }
        }
    })
}


const spellLookup = async (e) => {
    spellCard.innerHTML = ""
    const spellListHeader = document.createElement("h3")
    spellObj = {}
    const spellName = e.srcElement.innerText.replace(/\s+/g, '-').toLowerCase();
    spellCard.appendChild(spellListHeader).innerText = e.srcElement.innerText
    spellURL = `https://www.dnd5eapi.co/api/spells/${spellName}`
    const response = await fetch(spellURL)
    const data = await response.json()
    extractObjInfo(data, spellCard)
}

const filterSpell = async (spell) => {
    const spellURL = `https://www.dnd5eapi.co/api/spells/${spell}`
    const response = await fetch(spellURL)
    const data = await response.json()
    if (data.level <= parseInt(levels.value)){
        return true
    } else {
        return false
    }
}

const changeClass = async (e) => {
    e.preventDefault()
    spellCard.innerHTML = ""
    if (classList.value !==""){
        classDescript.innerText = ""
        classSpells.innerText = ""
        equipList.innerText = ""
        classSpellList.innerHTML = ""
        equip.innerHTML = ""
        profList.innerHTML = ""
        const classes = classList.value.toLowerCase()
        const response = await fetch (`https://www.dnd5eapi.co/api/classes/${classes}`)
        const data = await response.json()
        const profs = data.proficiencies
        const equipment = data.starting_equipment

        const profsHeader = document.createElement("h3")
        classDescript.appendChild(profsHeader).innerText= `These are the ${classes}'s proficiencies`
        profs.forEach(prof => {
            const proficiency = document.createElement("li")
            const name = prof.index
            profList.appendChild(proficiency).innerText= name
        })
        const equipmentParagraph = document.createElement("h3")
        equip.appendChild(equipmentParagraph).innerText= `These are the ${classes}'s starting equipment`
        equipment.forEach(gear => {
            const gearPiece = document.createElement("li")
            const name = gear.equipment.name
            equipList.appendChild(gearPiece).innerText= name
        })
        
        if (data.spells) {
            const spellsHeader = document.createElement("h3")
            const spellResponse = await fetch (`https://www.dnd5eapi.co/api/classes/${classes}/spells`)
            const spellData = await spellResponse.json()
            const spells = spellData.results
            classSpells.appendChild(spellsHeader).innerText= `These are the ${classes}'s available spells`
            spells.forEach(async spell => {
                const spellIndex = spell.index
                const spellName = spell.name
                const filtered = await filterSpell(spellIndex)
                if (filtered){
                    const spellTitle = document.createElement("li")
                    classSpellList.appendChild(spellTitle).innerText= spellName
                    spellTitle.className= "spell"
                    spellTitle.addEventListener("click", spellLookup)
                }
            })
        }
    }
}
const spell = document.querySelector(".spell")
document.addEventListener("DOMContentLoaded", addClasses())
classForm.addEventListener("submit", changeClass)