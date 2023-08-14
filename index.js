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
    const spellListHeader = document.createElement("h3")
    spellObj = {}
    const spellName = e.srcElement.innerText.replace(/\s+/g, '-').toLowerCase();
    spellCard.appendChild(spellListHeader).innerText = e.srcElement.innerText
    spellURL = `https://www.dnd5eapi.co/api/spells/${spellName}`
    //console.log(spellURL)
    const response = await fetch(spellURL)
    const data = await response.json()
    //console.log(data)
    extractObjInfo(data, spellCard)
}

const filterSpell = async (spell) => {
    //fetches the clicked on spell, and compares the level of the spell the level in the levelDropdown
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
    e.preventDefault()
    //when the submit button is clicked, the class information is fetched and extracted
    spellCard.innerHTML = ""
    if (classList.value !==""){
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
        //extract the data, and create a section for proficiencies and spells and equipment

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
            // console.log(gear)
            const gearPiece = document.createElement("li")
            const name = gear.equipment.name
            equipList.appendChild(gearPiece).innerText= name
        })
        
        if (data.spells) {
            //the spell list requires another fetch request
            const spellsHeader = document.createElement("h3")
            const spellResponse = await fetch (`https://www.dnd5eapi.co/api/classes/${classes}/spells`)
            const spellData = await spellResponse.json()
            // console.log(spellData)
            const spells = spellData.results
            //console.log(spells)
            classSpells.appendChild(spellsHeader).innerText= `These are the ${classes}'s available spells`
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
classForm.addEventListener("submit", changeClass)