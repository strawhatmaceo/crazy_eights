import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

let scene, camera, renderer;
let cardSize, backTexture;
let pointer, raycaster;
let selectedCard = null;

let allCards = [];
let randomSelection = [];
let chosenNumbers = [];
let playerCards = [];
let botCards = [];
let botCardNames = [];
let deckCards = [];
const categories = ['clubs', 'diamonds', 'hearts', 'spades'];


init();

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x961f02)

    renderer = new THREE.WebGLRenderer();
    // Sets window size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Sets pixel ratio so everything doesn't look low quality
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);

    cardSize = new THREE.BoxGeometry(.01, 5, 3.5);
    backTexture = new THREE.TextureLoader().load('/card_models/back/red.svg');
    backTexture.wrapS = THREE.RepeatWrapping;
    backTexture.wrapT = THREE.RepeatWrapping;

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
}


// Returns random integer from given range
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Only returns a number that doesn't already appear in the 'chosenNumbers' array
function pickUniqueNumber() {
    // Create randomNumber variable
    let randomNumber;

    // If the number is already in the 'chosenNumbers' array, keep redoing until number is unique
    do {
        randomNumber = randomIntFromRange(0, 51);
    } while (chosenNumbers.includes(randomNumber))

    // If number is not in the array, add it and return the number
    chosenNumbers.push(randomNumber);
    return randomNumber;
}


// Creates each card per category as an object
function createCardObjects() {
    // Loop for each category of cards: Clubs, Diamonds, Hearts & Spades
    for (let category = 0; category < 4; category++) {

        // Each category has 13 cards, so create 13 cards and place them into an array
        for (let i = 0; i <= 12; i++) {
            // Loads front texture
            const frontTexture = new THREE.TextureLoader().load(`/card_models/front/${categories[category]}/${i}.svg`);
            frontTexture.wrapS = THREE.RepeatWrapping;
            frontTexture.wrapT = THREE.RepeatWrapping;


            // Adds front texture and creates mesh material
            const front = new THREE.MeshBasicMaterial({
                map: frontTexture,
                transparent: true,
                side: THREE.DoubleSide
            });

            // Adds back texture and creates mesh material
            const back = new THREE.MeshBasicMaterial({
                map: backTexture,
                transparent: true,
                side: THREE.DoubleSide
            });

            // Creates card as mesh group
            const frontMesh = new THREE.Mesh(cardSize, front);
            const backMesh = new THREE.Mesh(cardSize, back);
            backMesh.position.x = -0.01;

            const card = new THREE.Group();

            card.add(frontMesh);
            card.add(backMesh);


            // Gives card group a name to differentiate it from the other card groups
            card.name = `${categories[category]}_${i}`;
            card.layers.set(0);

            // Pushes card into array containing all cards
            allCards.push(card);
        }
    }
}

// Creates deck of given amount of cards
function createDeckOfCards(amountOfCards, isBot) {
    for (let i = 0; i < amountOfCards; i++) {
        const randomNum = pickUniqueNumber();
        const card = allCards[randomNum];
        const cardName = card.name;

        randomSelection.push(card);
        deckCards.push(card);

        if (isBot) {
            botCards.push(card);
            botCardNames.push(cardName.split('_'));
        }
        else {
            playerCards.push(card);
        }
    }

    console.log(playerCards)
    console.log(botCardNames)
}

// Aligns each card next to each other, rotates them and adds cards to the scene
function alignCardPosition(yPos, isBot) {
    randomSelection.forEach(function (card, i) {
        card.position.x = (-3 + i) * 4;
        card.position.y = yPos;

        // Straight facing towards camera
        card.rotation.y = 4.71;

        if (isBot) {
            // card.children[1].position.x = 0.01;
        }

        scene.add(card);
    });

    // Empty array so multiple decks can be created
    randomSelection = [];
}

function showOpponentMatches(cardName){
    botCardNames.forEach(function(nameArray){
        if(nameArray.includes(cardName[0]) || nameArray.includes(cardName[1])){
            const cardIndex = botCardNames.indexOf(nameArray);
            botCards[cardIndex].position.y = 21;
        }
    });
}

// Sets up cards for player
function setUpPlayerCards() {
    createDeckOfCards(7, false);
    alignCardPosition(0, false);
}

// Sets up cards for bot opponent
function setUpBotCards() {
    createDeckOfCards(7, true);
    alignCardPosition(20, true);
}

createCardObjects();

setUpPlayerCards();
setUpBotCards();

function animate() {
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(playerCards, true);

    if (intersects.length) {
        selectedCard = intersects[0].object.parent;
        const cardName = selectedCard.name;

        const cardNameArray =  cardName.split('_');
        console.log('moved over card!');

        selectedCard.position.y = 1;

        showOpponentMatches(cardNameArray);

        return;
    }

    resetPosition();
}

function resetPosition() {
    // if (selectedCard !== null && selectedCard.position.y > 0) {
    //     selectedCard.position.y = 0;
    // }

    playerCards.forEach(function(card){
        card.position.y = 0;
    })
}


window.addEventListener('mousemove', onPointerMove)

if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}