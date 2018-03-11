interface Card {
    suit: "C" | "H" | "D" | "S",
    value: number
}

class Deck {
    cards: Card[] = [];

    constructor() {
        // populates deck
        this.cards = Array(52).fill(0).map((_, i): Card => {
            // Cards will be broken up into 4 suits.
            // nSuit = 0: Clubs
            //       = 1: Hearts
            //       = 2: Diamonds
            //       = 3: Spades

            let nSuit = Math.floor(i / 13)

            // Actual value of the card
            let value = i % 13 + 1;

            let newCard: Card = { suit: "S", value }

            switch (nSuit) {
                case 0:
                    newCard.suit = "C"
                    break;
                case 1:
                    newCard.suit = "H"
                    break;
                case 2:
                    newCard.suit = "D"
                    break;
                default:
                    newCard.suit = "S"
                    break;
            }

            return newCard;
        })
    }

    /**
     * Removes last card of the deck and returns it
     * @returns Last card of deck
     */
    drawCard(): Card {
        let drawnCard = this.cards.pop();
        return drawnCard;
    }

    /**
     * Adds a card to the deck
     * @param card Card to add to the deck
     * @param allowDuplicate Allows insertion of duplicate card, default false
     * @returns Returns true if card was added to deck
     */
    addCard(card: Card, allowDuplicate: boolean = false): boolean {
        let cardAlreadyInDeck = this.cards.some(c => {
            return c.suit == card.suit || c.value == card.value;
        })

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
    get isEmpty(): boolean {
        return !this.cards.length;
    }

    /**
     * Shuffles the deck's cards
     * @param n Number of shuffles
     */
    shuffleDeck(n: number = 1) {
        for (let shuffles = 0; shuffles <= n; shuffles++) {
            for (let i = this.cards.length - 1; i > 0; i--) {
                let randomIndex = Math.floor(Math.random() * (i + 1));
                let tmpCard: Card = this.cards[i];
                this.cards[i] = this.cards[randomIndex];
                this.cards[randomIndex] = tmpCard;
            }
        }
    }
}

class Game {
    deck: Deck = new Deck()
    discardPile: DiscardPile = new DiscardPile(this)
    turn: number = -1
    players: Player[];
    isOver: boolean = false;

    onGameEnd: (won: boolean) => void = () => 1;

    // This is magical. To avoid having a game which depends on instances of players who depend on an instance of game
    // The game constructor depends of an array of player constructors. I did not think it was possible, but it seems it is!
    constructor(playerConstructors: { new(arg: Game): Player }[], gameEnd: (playerWon: boolean) => void) {
        this.deck.shuffleDeck(12)
        this.onGameEnd = gameEnd;
        this.players = playerConstructors.map(playerConstructor => new playerConstructor(this));

        // Temporary, give the players names
        this.players.forEach((player, index) => {
            player.name = `Player ${index}`
        })
    }
    nextTurn() {
        if (this.isOver) {
            console.log(`Game is terminated.`)
            return;
        }
        this.turn = (this.turn + 1) % this.players.length;
        let currentPlayer = this.players[this.turn]
        let $this = this;
        currentPlayer.playTurn(function () {
            $this.gameStatusCheck();
            $this.nextTurn();
        });
    }
    gameStatusCheck() {
        let winningPlayer = this.players.find((player) => {
            if (player.hand.cards.length == 0) {
                return true;
            }
            return false;
        })

        if (winningPlayer) {
            this.isOver = true;
            console.log(`${winningPlayer.name} has emptied his hand. Victory!`)
            this.onGameEnd(this.turn == 0);
            return;
        }

        if (this.deck.isEmpty) {
            this.rebuildDeck();
        }
    }

    rebuildDeck() {
        // Add to deck all cards in the discard pile except last one
        this.deck.cards = this.deck.cards.concat(this.discardPile.cards.filter((c, index, cards) => {
            return (index + 1 != cards.length)
        }))

        // Reshuffling cards
        this.deck.shuffleDeck();

        // Set discard pile cards to the last one
        this.discardPile.cards = [this.discardPile.getLastCard()]

        // Good to go!
    }
}

class DiscardPile {
    cards: Card[] = [];
    game: Game;

    constructor(game: Game) {
        this.game = game;
        this.cards.push(game.deck.drawCard())
    }

    getLastCard(): Card {
        return this.cards[this.cards.length - 1];
    }

    canPlayCard(card: Card): boolean {
        return this.getLastCard().value == card.value
            || this.getLastCard().suit == card.suit
    }

    putCard(card: Card) {
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
            let drawnCards = [this.game.deck.drawCard(), this.game.deck.drawCard()]
            console.log(`${nextPlayer.name} was forced to pick 2 cards`, drawnCards);
            nextPlayer.hand.cards = nextPlayer.hand.cards.concat(drawnCards)
        }
    }
}

class Hand {
    cards: Card[] = [];
    addCard(card: Card) {
        this.cards.push(card)
    }
    dropCard(cardIndex: number) {
        this.cards.splice(cardIndex, 1);
    }
}

class Player {
    hand: Hand;
    game: Game;
    name: string = "unknown"
    skipTurn: boolean = false;
    isBot: boolean = false;
    constructor(game: Game) {
        this.hand = new Hand();
        this.game = game;
        // Populate hand with 8 cards
        for (let i = 0; i < 8 && !game.deck.isEmpty; i++) {
            this.hand.addCard(game.deck.drawCard());
        }
    }

    /**
     * Executes whatever is necessary to run the turn
     * @param done Callback for when turn is finished
     */
    runTurn(done: () => void) {
        // TODO: Allow human player to play (Interaction with DOM required)
        // Deferred for subsequent assignment
    }

    /**
     * Runs checks before running turn and calls runTurn()
     * @param done Callback for when turn is finished
     */
    playTurn(done: () => void) {
        if (this.skipTurn) {
            console.log(`${this.name}'s turn is skipped.`)
            this.skipTurn = false;
            return done();
        }

        this.runTurn(done);
    }
}

class BotPlayer extends Player {
    isBot = true

    runTurn(done: () => void) {
        console.log(`It is ${this.name}'s turn! He has ${this.hand.cards.length} cards remaining.`, [].concat(this.hand.cards))

        // Artificial delay before playing
        setTimeout(_ => {

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
                        console.log("An 8 was played! Changing suit to", card.suit)
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
                    console.log(`${this.name} could not play any card. Drawing.`)
                } else {
                    console.log("Deck is empty! Rebuilding using discard pile.")
                    this.game.rebuildDeck();
                }

                // Pick a new card
                let newCard = this.game.deck.drawCard();
                this.hand.addCard(newCard);
                console.log("Drew", newCard);
            }


            console.log(`Turn is finished, ending turn`);

            return done();

        }, 300)
    }
}

class Bet {
    onGameEnded: (moneyRemaningChange: number) => void;
    game: Game;
    players = [Player, BotPlayer];
    better: User;
    betAmount: number;
    constructor(betAmount: number, better: User, onBetEnd: ()=>void, hasHuman: boolean = true) {
        
        if (!hasHuman) {
            this.players[0] = BotPlayer;
        }
        
        this.game = new Game(this.players, (playerWin) => {
            if (playerWin) {
                console.log(`${this.better.name} has won ${this.betAmount}`)
                this.better.moneyRemaning += this.betAmount;

            }
            else {
                console.log(`${this.better.name} has lost ${this.betAmount}`)
                this.better.moneyRemaning -= this.betAmount;
            }
            onBetEnd();
        })
        this.betAmount = betAmount;
        this.better = better;
    }

    run() {
        this.game.nextTurn();
    }
}

class User {
    name: string
    username: string
    phoneNumber: string
    postalCode: string
    moneyRemaning: number
    constructor(name: string, username: string, phoneNumber: string, postalCode: string, moneyRemaning: number) {
        Object.assign(this, { name, username, phoneNumber, postalCode, moneyRemaning });
    }
}