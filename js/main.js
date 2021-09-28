const myFactsTemplate = require('./solarBodyFactsTemplate.hbs')
const myImageTemplate = require('./solarBodyImageTemplate.hbs')

function createFacts(solarBodyData) {
    let container = document.querySelector('#factsTemplateContainer')
    container.innerHTML = myFactsTemplate(solarBodyData)
}

function hideErrorMessages() {
    document.querySelector('#searchErrorMessage').style.display='none'
    document.querySelector('#noImageMessage').style.display='none'
}

const navLinks = document.querySelectorAll('li')
navLinks.forEach(link => link.addEventListener('click', e => {
        hideErrorMessages()
        let apiId = link.dataset.apiId
        getSolarBody(apiId)
    })
)

function createImage(solarBodyData) {
    let container = document.querySelector('#imageTemplateContainer')
    container.innerHTML = myImageTemplate(solarBodyData)
}

function checkIfExists(allSolarBodies, userInput) {
    let englishNames = []
    allSolarBodies.forEach(body => englishNames.push((body.englishName).toLowerCase()))
    if (englishNames.includes(userInput)) {
        let apiId = allSolarBodies[englishNames.indexOf(userInput)].id
        getSolarBody(apiId)
    } else {
        document.querySelector('#searchErrorMessage').style.display='block'
    }
}

function getSolarBody(apiId) {
    fetch(`https://api.le-systeme-solaire.net/rest/bodies/${apiId}`)
        .then(data => data.json())
        .catch(() => console.log('Sorry, the first promise failed.'))
        .then(solarBody => {
            prepareFacts(solarBody)
            prepareImage(solarBody)
        }).catch(() => console.log('Sorry, something went wrong!'))
}

function cutDecimals(decimalNr) {
    return Number(decimalNr.toFixed(2))
}

function prepareImage(solarBody) {
    let imageData = {
        'fileName': (solarBody.englishName).toLowerCase()
    }
    let planetsWithImages = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon']
    if (planetsWithImages.includes((imageData.fileName).toLowerCase()) === false) {
        imageData.fileName = 'default'
        document.querySelector('#noImageMessage').style.display = 'block'
    }
    createImage(imageData)
}

function prepareFacts(solarBody) {
    solarBody.sideralOrbit /= 24
    for (const key in solarBody) {
        if (typeof solarBody[key] === 'number') {
            solarBody[key] = cutDecimals(solarBody[key])
        }
    }
    let facts = {
        'discoveredBy': solarBody.discoveredBy,
        'englishName': solarBody.englishName,
        'rotationTime': solarBody.sideralRotation + ' days',
        'revolutionPeriod': solarBody.sideralOrbit + ' days',
        'radius': solarBody.meanRadius + ' km',
        'averageTemp': solarBody.avgTemp + ' K',
        'mass': solarBody.mass.massValue,
        'massExponent': solarBody.mass.massExponent + ' kg',
        'volume': solarBody.vol.volValue,
        'volumeExponent': solarBody.vol.volExponent + ' km³',
        'density': solarBody.density + ' g/cm³',
        'gravity': solarBody.gravity + ' m/s²',
    }
    for (const fact in facts) {
        if (facts[fact].toString().substring(0, 2) === '0 ') {
            facts[fact] = 'not in database'
        }
    }
    createFacts(facts)
    document.querySelector('#furtherFacts').hidden = true
    createEvents()
}

function createEvents() {
    let furtherFactsBtn = document.querySelector('#furtherFactsBtn')
    furtherFactsBtn.addEventListener('click', e => {
        e.preventDefault()
        document.querySelector('#furtherFacts').hidden = false
        document.querySelector('#overviewFacts').hidden = true
        document.querySelector('#overviewBtn').style.backgroundColor = '#fff'
        document.querySelector('#furtherFactsBtn').style.backgroundColor = '#FF9408'
    })
    let overviewBtn = document.querySelector('#overviewBtn')
    document.querySelector('#overviewBtn').addEventListener('click', e => {
        e.preventDefault()
        document.querySelector('#furtherFacts').hidden = true
        document.querySelector('#overviewFacts').hidden = false
        document.querySelector('#overviewBtn').style.backgroundColor = '#FF9408'
        document.querySelector('#furtherFactsBtn').style.backgroundColor = '#fff'
    })
}

let searchSubmitButton = document.querySelector('#searchSubmitBtn')
searchSubmitButton.addEventListener('click', e => {
    e.preventDefault()
    hideErrorMessages()
    let userInput = document.querySelector('#userInput').value
    if (userInput !== '') {
        userInput.toLowerCase()
        fetch('https://api.le-systeme-solaire.net/rest/bodies')
            .then(data => data.json())
            .catch(() => console.log('Sorry, the first promise failed.'))
            .then(jsonData => {
                let allSolarBodies = jsonData.bodies
                checkIfExists(allSolarBodies, userInput)
                document.querySelector('#userInput').value = ''
            }).catch(() => console.log('Sorry, something went wrong.'))
    }
})

getSolarBody('terre')
