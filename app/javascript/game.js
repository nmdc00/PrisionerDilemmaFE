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
    
    await checkPlayerJoined();
}

async function checkPlayerJoined() {
    const playerAddress = await web3.eth.getAccounts().then(accounts => accounts[0]);
    
    fetch(`/players/check_join_status?address=${playerAddress}`)
        .then(response => {
            if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
            }
            return response.json(); 
        })
        .then(data => {
            if (data.joined) {
            document.getElementById('joinButton').disabled = true;
            }
        })
        .catch(error => console.error("Request failed:", error));
  }
  
  // Call this function on page load
  checkPlayerJoined();
// Join the game
async function joinGame() {
    const playerAddress = await web3.eth.getAccounts().then(accounts => accounts[0]);

    fetch(`/players/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: playerAddress })
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
          }
        });

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
async function commitChoice(betray, nonce) {
    try {
        // Ensure 'betray' is boolean and 'nonce' is a number
        const isBetray = Boolean(betray); // Convert to boolean, just in case
        const parsedNonce = parseInt(nonce, 10); // Convert to integer

        // Call the contract's commitChoice function
        await gameContract.methods.commitChoice(isBetray, parsedNonce).send({ from: playerAddress });
        console.log("Choice committed successfully!");
    } catch (error) {
        console.error("Error committing choice:", error);
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
