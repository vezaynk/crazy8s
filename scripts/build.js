class Deck {
    constructor() {
        this.cards = [];
        // populates deck
        this.cards = Array(52).fill(0).map((_, i) => {
            // Cards will be broken up into 4 suits.
            // nSuit = 0: Clubs
            //       = 1: Hearts
            //       = 2: Diamonds
            //       = 3: Spades
            let nSuit = Math.floor(i / 13);
            // Actual value of the card
            let value = i % 13 + 1;
            let newCard = { suit: "S", value };
            switch (nSuit) {
                case 0:
                    newCard.suit = "C";
                    break;
                case 1:
                    newCard.suit = "H";
                    break;
                case 2:
                    newCard.suit = "D";
                    break;
                default:
                    newCard.suit = "S";
                    break;
            }
            return newCard;
        });
    }
    /**
     * Removes last card of the deck and returns it
     * @returns Last card of deck
     */
    drawCard() {
        let drawnCard = this.cards.pop();
        return drawnCard;
    }
    /**
     * Adds a card to the deck
     * @param card Card to add to the deck
     * @param allowDuplicate Allows insertion of duplicate card, default false
     * @returns Returns true if card was added to deck
     */
    addCard(card, allowDuplicate = false) {
        let cardAlreadyInDeck = this.cards.some(c => {
            return c.suit == card.suit || c.value == card.value;
        });
        if (cardAlreadyInDeck && !allowDuplicate) {
            return false;
        }
        this.cards.unshift(card);
        return true;
    }
    /**
     * Checks if deck is empty
     * @returns false if deck has at least 1 card left, true if empty
     */
    get isEmpty() {
        return !this.cards.length;
    }
    /**
     * Shuffles the deck's cards
     * @param n Number of shuffles
     */
    shuffleDeck(n = 1) {
        for (let shuffles = 0; shuffles <= n; shuffles++) {
            for (let i = this.cards.length - 1; i > 0; i--) {
                let randomIndex = Math.floor(Math.random() * (i + 1));
                let tmpCard = this.cards[i];
                this.cards[i] = this.cards[randomIndex];
                this.cards[randomIndex] = tmpCard;
            }
        }
    }
}
class Game {
    constructor() {
        this.deck = new Deck();
        this.turn = -1;
        this.players = [];
        this.deck.shuffleDeck(12);
        this.discardPile = new DiscardPile(this);
    }
    nextTurn() {
        if (this.isOver()) {
            console.log(`Game is terminated.`);
            return;
        }
        this.turn = (this.turn + 1) % this.players.length;
        let currentPlayer = this.players[this.turn];
        return currentPlayer.playTurn();
    }
    isOver() {
        let winningPlayer = this.players.find(player => {
            if (player.hand.cards.length == 0) {
                return true;
            }
            return false;
        });
        if (winningPlayer) {
            console.log(`${winningPlayer.name} has emptied his hand. Victory!`);
            return true;
        }
        if (this.deck.isEmpty) {
            this.rebuildDeck();
        }
        return false;
    }
    rebuildDeck() {
        // Add to deck all cards in the discard pile except last one
        this.deck.cards = this.deck.cards.concat(this.discardPile.cards.filter((c, index, cards) => {
            return (index + 1 != cards.length);
        }));
        // Reshuffling cards
        this.deck.shuffleDeck();
        // Set discard pile cards to the last one
        this.discardPile.cards = [this.discardPile.getLastCard()];
        // Good to go!
    }
    reset() {
    }
}
class DiscardPile {
    constructor(game) {
        this.cards = [];
        this.game = game;
        this.cards.push(game.deck.drawCard());
    }
    getLastCard() {
        return this.cards[this.cards.length - 1];
    }
    canPlayCard(card) {
        return this.getLastCard().value == card.value
            || this.getLastCard().suit == card.suit;
    }
    putCard(card) {
        this.cards.push(card);
        let turn = this.game.turn;
        let playerCount = this.game.players.length;
        let nextPlayer = this.game.players[(turn + 1) % playerCount];
        // Jack makes the next player skip his turn
        if (card.value == 11) {
            nextPlayer.skipTurn = true;
        }
        // Two makes the next player pick to cards
        if (card.value == 2) {
            if (this.game.deck.cards.length < 2) {
                this.game.rebuildDeck();
            }
            let drawnCards = [this.game.deck.drawCard(), this.game.deck.drawCard()];
            console.log(`${nextPlayer.name} was forced to pick 2 cards`, drawnCards);
            nextPlayer.hand.cards = nextPlayer.hand.cards.concat(drawnCards);
        }
    }
}
class Hand {
    constructor() {
        this.cards = [];
    }
    addCard(card) {
        this.cards.push(card);
    }
    dropCard(cardIndex) {
        this.cards.splice(cardIndex, 1);
    }
}
class Player {
    constructor(game) {
        this.name = "unknown";
        this.skipTurn = false;
        this.isBot = false;
        this.hand = new Hand();
        this.game = game;
        // Populate hand with 8 cards
        for (let i = 0; i < 8 && !game.deck.isEmpty; i++) {
            this.hand.addCard(game.deck.drawCard());
        }
    }
    /**
     *
     */
    getCardIndexToPlay() {
        return new Promise(userSelectCard);
    }
    /**
     * Executes whatever is necessary to run the turn
     * @param done Callback for when turn is finished
     */
    runTurn() {
        return new Promise(async (resolve) => {
            console.log("Human was suppose to play");
            let cardIndex = await this.getCardIndexToPlay();
            let card = this.hand.cards[cardIndex];
            console.log(card);
            resolve();
            // TODO: Allow human player to play (Interaction with DOM required)
        });
    }
    /**
     * Runs checks before running turn and calls runTurn()
     * @param done Callback for when turn is finished
     */
    playTurn() {
        return new Promise(async (resolve) => {
            if (this.skipTurn) {
                // Skip players turn.
                console.log(`${this.name}'s turn is skipped.`);
                this.skipTurn = false;
            }
            else {
                await this.runTurn();
            }
            resolve();
        });
    }
}
class BotPlayer extends Player {
    constructor() {
        super(...arguments);
        this.isBot = true;
    }
    getCardIndexToPlay() {
        return new Promise(resolve => {
            let index = this.hand.cards.findIndex((card, index) => this.game.discardPile.canPlayCard(card));
            resolve(index);
        });
    }
    /**
     * Bot-executed turn. Delays by 300 and plays the first card it can.
     */
    runTurn() {
        return new Promise(resolve => {
            console.log(`It is ${this.name}'s turn! He has ${this.hand.cards.length} cards remaining.`, [].concat(this.hand.cards));
            // Artificial delay before playing
            setTimeout(async (_) => {
                let cardIndex = await this.getCardIndexToPlay();
                let card = this.hand.cards[cardIndex];
                // No playable card was found
                if (!card) {
                    if (!this.game.deck.isEmpty) {
                        console.log(`${this.name} could not play any card. Drawing.`);
                    }
                    else {
                        console.log("Deck is empty! Rebuilding using discard pile.");
                        this.game.rebuildDeck();
                    }
                    // Pick a new card
                    let newCard = this.game.deck.drawCard();
                    this.hand.addCard(newCard);
                    console.log("Drew", newCard);
                }
                else {
                    if (card.value == 8) {
                        switch (Math.floor(Math.random() * 4)) {
                            case 0:
                                card.suit = 'S';
                                break;
                            case 1:
                                card.suit = 'C';
                                break;
                            case 2:
                                card.suit = 'D';
                                break;
                            case 3:
                                card.suit = 'H';
                                break;
                        }
                        console.log("An 8 was played! Changing suit to", card.suit);
                    }
                    this.hand.dropCard(cardIndex);
                    this.game.discardPile.putCard(card);
                    console.log(`${this.name} is Playing`, card);
                }
                console.log(`Turn is finished, ending turn`);
                return resolve();
            }, 300);
        });
    }
}
class Casino {
    constructor(user, hasHuman = true) {
        this.betAmount = 0;
        this.renderHook = function () { };
        this.user = user;
        this.hasHuman = hasHuman;
    }
    executeBet() {
        let game = new Game();
        this.game = game;
        let botPlayer = new BotPlayer(game);
        botPlayer.name = "Bot";
        let humanPlayer = this.hasHuman ? new Player(game) : new BotPlayer(game);
        humanPlayer.name = "Human";
        game.players.push(humanPlayer, botPlayer);
        return new Promise(async (resolve, reject) => {
            if (this.betAmount > this.user.moneyRemaining) {
                this.betAmount = 0;
                console.log("Betting more than has money. Kill.");
                return reject();
            }
            this.renderHook();
            while (!this.game.isOver()) {
                await this.game.nextTurn();
                this.renderHook();
            }
            this.renderHook();
            let isPlayerWinner = this.game.turn == 0;
            if (isPlayerWinner) {
                this.user.moneyRemaining += this.betAmount;
            }
            else {
                this.user.moneyRemaining -= this.betAmount;
            }
            resolve(isPlayerWinner);
        });
    }
}
class User {
    constructor(name, username, phoneNumber, postalCode, moneyRemaining) {
        Object.assign(this, { name, username, phoneNumber, postalCode, moneyRemaining });
    }
}
function renderCard(card, faceUp) {
    // Determine primary color
    let color = "black";
    if (card.suit == 'H' || card.suit == 'D')
        color = "red";
    // Determine card text
    let text = "";
    let letter = card.value.toString();
    // Determine corner text and letter
    switch (card.value) {
        case 1:
            text = "One of ";
            letter = "A";
            break;
        case 2:
            text = "Two of ";
            break;
        case 3:
            text = "Three of ";
            break;
        case 4:
            text = "Four of ";
            break;
        case 5:
            text = "Five of ";
            break;
        case 6:
            text = "Six of ";
            break;
        case 7:
            text = "Seven of ";
            break;
        case 8:
            text = "Eight of ";
            break;
        case 9:
            text = "Nine of ";
            break;
        case 10:
            text = "Ten of ";
            break;
        case 11:
            text = "Jack of ";
            letter = "J";
            break;
        case 12:
            text = "Queen of ";
            letter = "Q";
            break;
        case 13:
            text = "King of ";
            letter = "K";
            break;
    }
    let entity = "";
    switch (card.suit) {
        case 'H':
            text += "Hearts";
            entity = "&hearts;";
            break;
        case 'C':
            text += "clubs";
            entity = "&clubs;";
            break;
        case 'D':
            text += "Diamonds";
            entity = "&diams;";
            break;
        case 'S':
            text += "Spades";
            entity = "&spades;";
            break;
    }
    let el = document.createElement('div');
    el.setAttribute("data-suit", card.suit);
    el.setAttribute("data-value", card.value.toString());
    el.className = `card ${faceUp ? 'front-side' : 'back-side'} ${color}`;
    let html = (`
    <div class="card--back">
        <section>
        </section>
        <div class="overlay">
            <div class="quadrant">
                <span>&hearts;</span>
            </div>
            <div class="quadrant">
                <span>&spades;</span>
            </div>
            <div class="quadrant">
                <span>&clubs;</span>
            </div>
            <div class="quadrant">
                <span>&diams;</span>
            </div>
        </div>
        <section>
        </section>
    </div>
    <div class="card--front">
        <header>
            <span class="number">${letter}</span>
            <span class="text">${text}</span class="text">
        </header>
        <section>
            ${card.value <= 10 ? Array(card.value).fill('<span>' + entity + '</span>').join("") : `<span>${letter}</span>`}
        </section>
        <header>
            <span class="number">${letter}</span>
            <span class="text">${text}</span class="text">
        </header>
    </div>
    `);
    el.innerHTML = html;
    return el;
}
function renderHand(hand, faceUp) {
    let elHand = document.createElement('section');
    elHand.className = "hand";
    hand.cards.forEach(card => elHand.appendChild(renderCard(card, faceUp)));
    return elHand;
}
function renderHeader(casino) {
    let elInfo = document.createElement("div");
    let elTopBar = document.createElement("div");
    elTopBar.className = "userInfo";
    elTopBar.innerHTML = `<div class="userInfo">
    <div class="toolbar">
        <h1>The Happy Gambler</h1>
        <p>
            <span>
                <a id="showInfoBox" href="#">${casino.user.name}</a>'s turn |</span>
            <span>Bet: ${casino.betAmount}$ |</span>
            <span>Pick a card</span>
        </p>
    </div>
</div>`;
    let elShowInfoBox = elTopBar.querySelector("#showInfoBox");
    let elInfoBox = renderInfoBox(casino.user);
    elShowInfoBox.addEventListener("click", function () {
        elInfoBox.classList.toggle("hidden");
    });
    elInfo.appendChild(elTopBar);
    elInfo.appendChild(elInfoBox);
    return elInfo;
}
function renderInfoBox(user) {
    let el = document.createElement("div");
    el.id = "infoBox";
    el.innerHTML = `
    <table>
        <tr>
            <th>Name</th>
            <td>${user.name}</td>
        </tr>
        <tr>
            <th>Username</th>
            <td>${user.username}</td>
        </tr>
        <tr>
            <th>Phone number</th>
            <td>${user.phoneNumber}</td>
        </tr>
        <tr>
            <th>Postal code</th>
            <td>${user.postalCode}</td>
        </tr>
        <tr>
            <th>Money Remaining</th>
            <td>${user.moneyRemaining}$</td>
        </tr>
    </table>
`;
    return el;
}
function renderDeck(topCard) {
    let el = document.createElement("section");
    el.className = "deck";
    el.appendChild(renderCard(topCard, false));
    el.appendChild(renderCard(topCard, true));
    return el;
}
function renderTable(casino) {
    let el = document.createElement("div");
    el.className = "container";
    // Render opponent deck
    el.appendChild(renderHand(casino.game.players[1].hand, false));
    // Render shared deck
    el.appendChild(renderDeck(casino.game.discardPile.cards[casino.game.discardPile.cards.length - 1]));
    // Render player deck
    el.appendChild(renderHand(casino.game.players[0].hand, true));
    return el;
}
function renderView(root, casino) {
    root.innerHTML = "";
    // Render info boxes and header
    root.appendChild(renderHeader(casino));
    // Render everything else
    let handPlayer = renderTable(casino);
    handPlayer.children.item(2).id = "hand-player";
    root.appendChild(handPlayer);
}
function userSelectCard(resolve) {
    let cards = [...root.querySelectorAll("#hand-player .card")];
    cards.forEach((elCard, index) => {
        elCard.addEventListener("click", function () {
            let playable = casino.game.discardPile.canPlayCard({
                suit: this.getAttribute("data-suit"),
                value: +this.getAttribute("data-value")
            });
            if (playable)
                resolve(index);
            else
                alert("Nope");
        });
    });
}
let root = document.querySelector("body");
let monkeyUser = new User("Slava", "slava", "1234", "1234", 999);
let casino = new Casino(monkeyUser, true);
casino.betAmount = 30;
casino.renderHook = function () {
    renderView(root, casino);
};
casino.executeBet();
// Tests
/*
console.log("Testing the deck");
let deck = new Deck();

console.log("Checking if deck is correctly populated");
console.assert(deck.cards.length == 52, `There are ${deck.cards.length} deck.cards instead of 52`, deck.cards, deck)

console.log("Checking individual suits");
let testSuits = [{ letter: "C", name: "Clubs" }, { letter: "S", name: "Spades" }, { letter: "D", name: "Diamonds" }, { letter: "H", name: "Hearts" }]
let cardsPerSuit = 13;
testSuits.forEach(test => {
    console.log(`Testing for ${cardsPerSuit} ${test.name}`);
    let cards = deck.cards.filter(c => {
        return c.suit == test.letter;
    })
    console.assert(cards.length == cardsPerSuit, `There are ${cards.length} ${test.name} instead of ${cardsPerSuit}`, cards, deck)
})


testSuits.forEach(test => {
    console.log(`Testing for 13 unique cards in ${test.name}`);
    let cards = deck.cards.sort((a, b) => a.value - b.value).filter(c => {
        return c.suit == test.letter;
    })
    let seqCards = cards.filter((card, index) => {
        return card.value == index + 1;
    })

    console.assert(seqCards.length == cardsPerSuit, `Sequence-breaking card value for ${cardsPerSuit}`, cards, deck)
})

console.log("Shuffling deck")
deck.shuffleDeck()
console.log("Once", deck.cards.map(c => c.suit + c.value).join(" "))
deck.shuffleDeck()
console.log("Twice", deck.cards.map(c => c.suit + c.value).join(" "))
deck.shuffleDeck()
console.log("Thrice", deck.cards.map(c => c.suit + c.value).join(" "))

console.log("Shuffling 300 times and checking for duplicate outputs. Tolerating a maximum of 2 matches.")
let matches = 0;
let shuffleResults = [];
Array(300).fill(0).forEach(_ => {
    deck.shuffleDeck()
    let text = deck.cards.map(c => c.suit + c.value).join(" ")
    if (shuffleResults.indexOf(text) === -1)
        shuffleResults.push(text)
    else
        matches++;
})

console.assert(matches <= 2, "Too many matches after shuffling");

console.log("Test playing all cards");
let playedCards = [];

while (!deck.isEmpty) {
    playedCards.push(deck.drawCard());
}

console.log("Testing if all cards were played.");
testSuits.forEach(test => {
    console.log(`Testing for 13 unique cards in ${test.name}`);
    let cards = playedCards.sort((a, b) => a.value - b.value).filter(c => {
        return c.suit == test.letter;
    })
    let seqCards = cards.filter((card, index) => {
        return card.value == index + 1;
    })

    console.assert(seqCards.length == cardsPerSuit, `Sequence-breaking card value for ${cardsPerSuit}`, cards, deck)
})


console.log("Executing game with 2 bot players")
let game = new Game();
let humanPlayer = new BotPlayer(game);
humanPlayer.name = "Human";
let botPlayer = new BotPlayer(game);
botPlayer.name = "Bot";

game.players.push(humanPlayer, botPlayer);

async function runGame() {
    while (!game.isOver()) {
        await game.nextTurn();
    }
}

//runGame();

console.log("Executing bet with 2 bot players")
let monkeyUser = new User("Slava", "slava", "1234", "1234", 999);

let casino = new Casino(monkeyUser, false);
casino.betAmount = 30;


casino.executeBet().then(won=>{
  if (won) {
    console.log("The player won and now has $" + monkeyUser.moneyRemaining);
  } else {
    console.log("The player lost and now has $" + monkeyUser.moneyRemaining);
  }
});
*/ 
//# sourceMappingURL=build.js.map