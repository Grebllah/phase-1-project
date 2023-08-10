const classList = document.querySelector("#classDropdown")
const levels = document.querySelector("#levelDropdown")
const classDescript = document.querySelector("#classDescription")
const classButton = document.querySelector("#classButton")
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
let excludedItems = ["classes", "higher_level", "index", "school", "subclasses", "url", "damage", "dc"]

const extractObjInfo = (obj, parent) => {
    const infoObj = Object.entries(obj)
    infoObj.forEach(entry => {
        // console.log(entry)
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
    //console.log(infoObj)
}


const spellLookup = async (e) => {
    spellCard.innerHTML = ""
    spellObj = {}
    const spellName = e.srcElement.innerText.replace(/\s+/g, '-').toLowerCase();
    spellURL = `https://www.dnd5eapi.co/api/spells/${spellName}`
    //console.log(spellURL)
    const response = await fetch(spellURL)
    const data = await response.json()
    //console.log(data)
    extractObjInfo(data, spellCard)
}

const filterSpell = async (spell) => {
    const spellURL = `https://www.dnd5eapi.co/api/spells/${spell}`
    const response = await fetch(spellURL)
    const data = await response.json()
    // console.log(data)
    if (data.level <= parseInt(levels.value)){
        //console.log("true")
        return true
    } else {
        //console.log("false")
        return false
    }
}

const changeClass = async (e) => {
    //when the submit button is clicked, the class information is fetched and extracted
    spellCard.innerHTML = ""
    if (classList.value !==""){
        e.preventDefault()
        classDescript.innerText = ""
        classSpells.innerText = ""
        equipList.innerText = ""
        classSpellList.innerHTML = ""
        equip.innerHTML = ""
        profList.innerHTML = ""
        //clears previous displayed info
        const classes = classList.value.toLowerCase()
        const response = await fetch (`https://www.dnd5eapi.co/api/classes/${classes}`)
        const data = await response.json()
        //console.log(data)
        const profs = data.proficiencies
        const equipment = data.starting_equipment
        const profsHeader = document.createElement("h3")
        classDescript.appendChild(profsHeader).innerText= `This is the ${classes}'s proficiencies`
        profs.forEach(prof => {
            const proficiency = document.createElement("li")
            const name = prof.index
            profList.appendChild(proficiency).innerText= name
        })
        const equipmentParagraph = document.createElement("h3")
        equip.appendChild(equipmentParagraph).innerText= `This is the ${classes}'s starting equipment`
        equipment.forEach(gear => {
            // console.log(gear)
            const gearPiece = document.createElement("li")
            const name = gear.equipment.name
            equipList.appendChild(gearPiece).innerText= name
        })
        
        if (data.spells) {
            const spellsParagraph = document.createElement("h3")
            const spellResponse = await fetch (`https://www.dnd5eapi.co/api/classes/${classes}/spells`)
            const spellData = await spellResponse.json()
            // console.log(spellData)
            const spells = spellData.results
            //console.log(spells)
            classSpells.appendChild(spellsParagraph).innerText= `This is the ${classes}'s spell-list`
            spells.forEach(async spell => {
                //console.log(spell)
                const spellIndex = spell.index
                const spellName = spell.name
                // here is where I filter the results, as I cant access the spell list and the levels of each
                // individual spell at the same time
                const filtered = await filterSpell(spellIndex)
                if (filtered){
                    //console.log("true")
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
classButton.addEventListener("click", changeClass)