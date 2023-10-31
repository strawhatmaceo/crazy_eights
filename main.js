import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

// Sets window size
renderer.setSize(window.innerWidth, window.innerHeight);

// Sets pixel ratio so everything doesn't look high quality
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const size = new THREE.BoxGeometry(0.01, 5, 3.5);
const backTexture = new THREE.TextureLoader().load('/card_models/back/red.svg');

let allCards = [];
let randomSelection = [];
let chosenNumbers = [];
const categories = ['clubs', 'diamonds', 'hearts', 'spades'];

// Returns random integer from given range
function randomIntFromRange(min, max) { 
    return Math.floor(Math.random() * (max - min) + min);
}

// Only returns a number that doesn't already appear in the 'chosenNumbers' array
function pickUniqueNumber() {
    let randomNumber = randomIntFromRange(0, 51);

    while (chosenNumbers.includes(randomNumber)) {
        randomNumber = randomIntFromRange(0, 51);
    }

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

            // Creates card as mesh object
            const card = new THREE.Mesh(size, [front, back]);

            card.name = `/card_models/front/${categories[category]}/${i}.svg`;

            // Rotates card so the front is fully visible
            card.rotateY(4.70);

            // Pushes card into array containing all cards
            allCards.push(card);
        }
    }
}

// Creates deck of given amount of cards
function createDeckOfCards(amountOfCards) {
    for (let i = 0; i < amountOfCards; i++) {
        const randomNum = pickUniqueNumber();

        console.log(randomNum);
        const card = allCards[randomNum];

        randomSelection.push(card);
    }
}

// Aligns each card next to each other and adds cards to the scene
function alignCardPosition() {
    randomSelection.forEach(function (card, i) {
        card.position.x = (-3 + i) * 4;

        scene.add(card);
    });
}

createCardObjects();
createDeckOfCards(7);
alignCardPosition();

camera.position.y = 10;
camera.position.z = 20;

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}



if (WebGL.isWebGLAvailable()) {
    animate();

} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}