// Tests

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

/*let human = new User("Slava", "slava", "1234", "1234", 999);
let bet = new Bet(30, human, ()=>{
    console.log(human.name, "now has", human.moneyRemaning)
}, false);

bet.run();*/

let game = new Game();
let humanPlayer = new Player(game);
humanPlayer.name = "Human";
let botPlayer = new BotPlayer(game);
botPlayer.name = "Bot";

game.players.push(humanPlayer, botPlayer);

async function runGame() {
    while (!game.isOver()) {
        await game.nextTurn();
    }
}

runGame();

