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
     * @returns Last card of deck or false if deck is empty
     */
    drawCard(): Card | false {
        return this.cards.length ? this.cards.pop() : false;
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

// Tests
console.log("Instantiate new deck");
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