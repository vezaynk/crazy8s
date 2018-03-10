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
        return this.cards.pop()
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
            for (let i = this.cards.length - 1; i >= 0; i--) {
                let randomIndex = Math.floor((Math.random() * 520)) % 52;
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
        this.players = playerConstructors.map(playerConstructor => new playerConstructor(this));
        this.nextTurn();
    }
    nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;
        let currentPlayer = this.players[this.turn]
        currentPlayer.playTurn();
    }
}

class DiscardPile {
    cards: Card[];

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
                this.hand.dropCard(index);
                this.game.discardPile.putCard(card);
                console.log("Bot is Playing", card);
                return true;
            }
            return false;
        });

        if (!playedCard) {
            this.hand.addCard(this.game.deck.drawCard());
            console.log("Bot could not play any ")
        }

        console.log("Bot turn is finished, ending turn")
        this.game.nextTurn();
    }
}

let game = new Game([BotPlayer])