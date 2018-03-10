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

        console.log(this.cards)
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
                let randomIndex = Math.floor(Math.random() * (i+1));
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
    // This is magical. To avoid having a game which depends on instances of players who depend on an instance of game
    // The game constructor depends of an array of player constructors. I did not think it was possible, but it seems it is!
    constructor(playerConstructors: { new(arg: Game): Player }[]) {
        this.deck.shuffleDeck(12)
        console.log(this.deck.cards)
        this.players = playerConstructors.map(playerConstructor => new playerConstructor(this));

        // Temporary, give the players names
        this.players.forEach((player, index) => {
            player.name = `Player ${index}`
        })

        this.nextTurn();
    }
    nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;
        let currentPlayer = this.players[this.turn]
        currentPlayer.playTurn();
    }
    rebuildDeck() {
        // set deck to all cards except last one
        this.deck.cards = this.discardPile.cards.filter((c, index, cards)=>{
            return (index+1 != cards.length)
        })

        // Reshuffling cards
        this.deck.shuffleDeck();

        // Set discard pile cards to the last one
        this.discardPile.cards = [this.discardPile.getLastCard()]

        // Good to go!
    }
}

class DiscardPile {
    cards: Card[] = [];

    constructor(game: Game) {
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
    }
}

class Hand {
    cards: Card[] = [];
    deck: Deck;
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
    constructor(game: Game) {
        this.hand = new Hand();
        this.game = game;
        // Populate hand with 8 cards
        for (let i = 0; i < 8 && !game.deck.isEmpty; i++) {
            this.hand.addCard(game.deck.drawCard());
        }
    }

    playTurn() {

    }
}

class BotPlayer extends Player {
    playTurn() {
        let playedCard = this.hand.cards.find((card, index) => {
            if (this.game.discardPile.canPlayCard(card)) {
                if (card.value == 8) {
                    card.suit = "H";
                }
                this.hand.dropCard(index);
                this.game.discardPile.putCard(card);
                console.log(`${this.name} is Playing`, card);
                return true;
            }
            return false;
        });

        if (!playedCard) {
            if (!this.game.deck.isEmpty) {
                console.log(`${this.name} could not play any card. Drawing.`)
            } else {
                console.log("Deck is empty! Using discard pile.")
                this.game.rebuildDeck();
            }
            this.hand.addCard(this.game.deck.drawCard());
        }

        console.log(`${this.name} turn is finished, ending turn`)

        if (this.hand.cards.length) {
            console.log(`${this.name} has ${this.hand.cards.length} cards remaining`)
            this.game.nextTurn();
        } else {
            // Game over. Victory.
            console.log(`${this.name} ran out of cards. Victory!`);
        }

    }
}

let game = new Game([BotPlayer, BotPlayer, BotPlayer])