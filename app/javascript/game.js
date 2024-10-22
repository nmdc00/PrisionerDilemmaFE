let web3;
let gameContract;
let pdcToken;
let userAccount;

import { pdcAbi, gameAbi } from './app.js';

// Initialize Web3 and contracts
async function initWeb3() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
    } else {
        console.error('MetaMask is not installed. Please install it to use this app.');
        return;
    }

    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    console.log('Connected account:', userAccount);

    // Initialize contracts after web3 is set
    gameContract = new web3.eth.Contract(gameAbi, GAME_CONTRACT_ADDRESS);
    pdcToken = new web3.eth.Contract(pdcAbi, PDC_TOKEN_ADDRESS);
}

// Join the game
async function joinGame() {
    console.log('Join Game button clicked');
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
    console.log(`Commit choice called with betray: ${betray}`);
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

// Initialize Web3 on page load
window.addEventListener('load', async () => {
    console.log('Page fully loaded');
    await initWeb3();
    
    // Attach button event listeners
    const joinGameButton = document.getElementById('joinGame');
    if (joinGameButton) {
        joinGameButton.addEventListener('click', joinGame);
        console.log('Join Game button listener attached');
    } else {
        console.error('Join Game button not found');
    }

    const commitBetrayButton = document.getElementById('commitBetray');
    if (commitBetrayButton) {
        commitBetrayButton.addEventListener('click', () => commitChoice(true));
        console.log('Commit Betray button listener attached');
    } else {
        console.error('Commit Betray button not found');
    }

    const commitCooperateButton = document.getElementById('commitCooperate');
    if (commitCooperateButton) {
        commitCooperateButton.addEventListener('click', () => commitChoice(false));
        console.log('Commit Cooperate button listener attached');
    } else {
        console.error('Commit Cooperate button not found');
    }

    const revealChoiceButton = document.getElementById('revealChoice');
    if (revealChoiceButton) {
        revealChoiceButton.addEventListener('click', revealChoice);
        console.log('Reveal Choice button listener attached');
    } else {
        console.error('Reveal Choice button not found');
    }
});
