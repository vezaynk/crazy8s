define("game", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            console.log(this.cards);
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
    exports.Deck = Deck;
    class Game {
        // This is magical. To avoid having a game which depends on instances of players who depend on an instance of game
        // The game constructor depends of an array of player constructors. I did not think it was possible, but it seems it is!
        constructor(playerConstructors) {
            this.deck = new Deck();
            this.discardPile = new DiscardPile(this);
            this.turn = -1;
            this.isOver = false;
            this.deck.shuffleDeck(12);
            console.log(this.deck.cards);
            this.players = playerConstructors.map(playerConstructor => new playerConstructor(this));
            // Temporary, give the players names
            this.players.forEach((player, index) => {
                player.name = `Player ${index}`;
            });
        }
        nextTurn() {
            this.turn = (this.turn + 1) % this.players.length;
            let currentPlayer = this.players[this.turn];
            let $this = this;
            currentPlayer.playTurn(function () {
                $this.gameStatusCheck();
                if (!$this.isOver)
                    $this.nextTurn();
            });
        }
        gameStatusCheck() {
            let winningPlayer = this.players.find((player) => {
                if (player.hand.cards.length == 0) {
                    return true;
                }
                return false;
            });
            if (winningPlayer) {
                this.isOver = true;
                console.log(`${winningPlayer.name} has emptied his hand. Victory!`);
            }
            if (this.deck.isEmpty) {
                this.rebuildDeck();
            }
        }
        rebuildDeck() {
            // set deck to all cards except last one
            this.deck.cards = this.discardPile.cards.filter((c, index, cards) => {
                return (index + 1 != cards.length);
            });
            // Reshuffling cards
            this.deck.shuffleDeck();
            // Set discard pile cards to the last one
            this.discardPile.cards = [this.discardPile.getLastCard()];
            // Good to go!
        }
    }
    exports.Game = Game;
    class DiscardPile {
        constructor(game) {
            this.cards = [];
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
    exports.Hand = Hand;
    class Player {
        constructor(game) {
            this.name = "unknown";
            this.hand = new Hand();
            this.game = game;
            // Populate hand with 8 cards
            for (let i = 0; i < 8 && !game.deck.isEmpty; i++) {
                this.hand.addCard(game.deck.drawCard());
            }
        }
        playTurn(done) {
            // TODO: Allow human player to play
        }
    }
    exports.Player = Player;
    class BotPlayer extends Player {
        playTurn(done) {
            console.log(`It is ${this.name}'s turn! He has ${this.hand.cards.length} cards remaining.`);
            // Look for a playable card and play it if possible
            let playedCard = this.hand.cards.find((card, index) => {
                if (this.game.discardPile.canPlayCard(card)) {
                    // Pick rando suit to change to
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
                    this.hand.dropCard(index);
                    this.game.discardPile.putCard(card);
                    console.log(`${this.name} is Playing`, card);
                    return true;
                }
                return false;
            });
            // No playable card was found
            if (!playedCard) {
                if (!this.game.deck.isEmpty) {
                    console.log(`${this.name} could not play any card. Drawing.`);
                }
                else {
                    console.log("Deck is empty! Rebuilding using discard pile.");
                    this.game.rebuildDeck();
                }
                // Pick a new card
                this.hand.addCard(this.game.deck.drawCard());
            }
            console.log(`Turn is finished, ending turn`);
            done();
        }
    }
    exports.BotPlayer = BotPlayer;
});
define("tests", ["require", "exports", "game"], function (require, exports, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Testing the deck");
    let deck = new game_1.Deck();
    console.log("Checking if deck is correctly populated");
    console.assert(deck.cards.length == 52, `There are ${deck.cards.length} deck.cards instead of 52`, deck.cards, deck);
    console.log("Checking individual suits");
    let testSuits = [{ letter: "C", name: "Clubs" }, { letter: "S", name: "Spades" }, { letter: "D", name: "Diamonds" }, { letter: "H", name: "Hearts" }];
    let cardsPerSuit = 13;
    testSuits.forEach(test => {
        console.log(`Testing for ${cardsPerSuit} ${test.name}`);
        let cards = deck.cards.filter(c => {
            return c.suit == test.letter;
        });
        console.assert(cards.length == cardsPerSuit, `There are ${cards.length} ${test.name} instead of ${cardsPerSuit}`, cards, deck);
    });
    testSuits.forEach(test => {
        console.log(`Testing for 13 unique cards in ${test.name}`);
        let cards = deck.cards.sort((a, b) => a.value - b.value).filter(c => {
            return c.suit == test.letter;
        });
        let seqCards = cards.filter((card, index) => {
            return card.value == index + 1;
        });
        console.assert(seqCards.length == cardsPerSuit, `Sequence-breaking card value for ${cardsPerSuit}`, cards, deck);
    });
    console.log("Shuffling deck");
    deck.shuffleDeck();
    console.log("Once", deck.cards.map(c => c.suit + c.value).join(" "));
    deck.shuffleDeck();
    console.log("Twice", deck.cards.map(c => c.suit + c.value).join(" "));
    deck.shuffleDeck();
    console.log("Thrice", deck.cards.map(c => c.suit + c.value).join(" "));
    console.log("Shuffling 300 times and checking for duplicate outputs. Tolerating a maximum of 2 matches.");
    let matches = 0;
    let shuffleResults = [];
    Array(300).fill(0).forEach(_ => {
        deck.shuffleDeck();
        let text = deck.cards.map(c => c.suit + c.value).join(" ");
        if (shuffleResults.indexOf(text) === -1)
            shuffleResults.push(text);
        else
            matches++;
    });
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
        });
        let seqCards = cards.filter((card, index) => {
            return card.value == index + 1;
        });
        console.assert(seqCards.length == cardsPerSuit, `Sequence-breaking card value for ${cardsPerSuit}`, cards, deck);
    });
    let game = new game_1.Game([game_1.BotPlayer, game_1.BotPlayer, game_1.BotPlayer]);
    game.nextTurn();
});
