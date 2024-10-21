import * as Web3 from 'https://cdn.jsdelivr.net/npm/web3/dist/web3.min.js';
require('dotenv').config();

let web3;
let gameContract;
let pdcToken;
let userAccount;

// Initialize Web3 and contracts
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
    } else {
        console.error('MetaMask not found. Please install MetaMask.');
        return;
    }

    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    console.log('Connected account:', userAccount);

    // Initialize contracts after web3 is set
    gameContract = new web3.eth.Contract(gameAbi, GAME_CONTRACT_ADDRESS);
    pdcToken = new web3.eth.Contract(pdcAbi, PDC_TOKEN_ADDRESS);

    // Display game info on load
    await displayGameInfo();
}

// Join the game
async function joinGame() {
    try {
        const entryFee = await gameContract.methods.entryFee().call();
        console.log('Entry Fee:', entryFee);

        // Approve token transfer to game contract
        await pdcToken.methods.approve(GAME_CONTRACT_ADDRESS, entryFee).send({ from: userAccount });

        // Join the game
        await gameContract.methods.joinGame().send({ from: userAccount });
        alert('Successfully joined the game!');
    } catch (error) {
        console.error('Error joining the game:', error);
        alert('Failed to join the game. Please check console for details.');
    }
}

// Commit choice
async function commitChoice(betray) {
    const nonce = Math.floor(Math.random() * 1000000); // Generate random nonce
    const commitment = web3.utils.soliditySha3(betray, nonce);

    try {
        await gameContract.methods.commitChoice(commitment).send({ from: userAccount });
        alert(`Committed to ${betray ? 'betray' : 'cooperate'}. Keep your nonce secret!`);
    } catch (error) {
        console.error('Error committing choice:', error);
        alert('Failed to commit choice. Please check console for details.');
    }
}

// Reveal choice
async function revealChoice() {
    const nonce = prompt('Enter your nonce:');
    const betray = confirm('Did you choose to betray? OK = Yes, Cancel = No');

    try {
        await gameContract.methods.revealChoice(betray, nonce).send({ from: userAccount });
        alert('Choice revealed!');
    } catch (error) {
        console.error('Error revealing choice:', error);
        alert('Failed to reveal choice. Please check console for details.');
    }
}

// Display game info
async function displayGameInfo() {
    try {
        const round = await gameContract.methods.currentRound().call();
        const status = await gameContract.methods.roundEndTime().call();

        document.getElementById('currentRound').textContent = round;
        document.getElementById('gameStatus').textContent = status > Math.floor(Date.now() / 1000) ? 'Ongoing' : 'Ended';
    } catch (error) {
        console.error('Error fetching game info:', error);
        alert('Failed to fetch game info. Please check console for details.');
    }
}

console.log('Ethereum object:', window.ethereum);

// Initialize Web3 on page load
window.addEventListener('load', initWeb3);

// Attach button event listeners
document.getElementById('joinGame').addEventListener('click', joinGame);
document.getElementById('commitBetray').addEventListener('click', () => commitChoice(true));
document.getElementById('commitCooperate').addEventListener('click', () => commitChoice(false));
document.getElementById('revealChoice').addEventListener('click', revealChoice);

initWeb3();
