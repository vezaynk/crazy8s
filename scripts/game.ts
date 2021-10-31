interface Card {
  suit: string; //"C" | "H" | "D" | "S",
  value: number;
}

class Deck {
  cards: Card[] = [];

  constructor() {
    // populates deck
    this.cards = Array(52)
      .fill(0)
      .map((_, i): Card => {
        // Cards will be broken up into 4 suits.
        // nSuit = 0: Clubs
        //       = 1: Hearts
        //       = 2: Diamonds
        //       = 3: Spades

        let nSuit = Math.floor(i / 13);

        // Actual value of the card
        let value = (i % 13) + 1;

        let newCard: Card = { suit: "S", value };

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
    let cardAlreadyInDeck = this.cards.some((c) => {
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
  deck: Deck = new Deck();
  discardPile: DiscardPile;
  turn: number = 1;
  players: Player[] = [];

  constructor() {
    this.deck.shuffleDeck(12);
    this.discardPile = new DiscardPile(this);
  }
  nextTurn() {
    if (this.isOver()) {
      console.log(`Game is terminated.`);
      return;
    }
    let currentPlayer = this.players[this.turn];
    return currentPlayer.playTurn();
  }
  isOver() {
    let winningPlayer = this.players.find((player) => {
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
    this.deck.cards = this.deck.cards.concat(
      this.discardPile.cards.filter((c, index, cards) => {
        return index + 1 != cards.length;
      })
    );

    // Reshuffling cards
    this.deck.shuffleDeck();

    // Set discard pile cards to the last one
    this.discardPile.cards = [this.discardPile.getLastCard()];

    // Good to go!
  }

  reset() {}
}

class DiscardPile {
  cards: Card[] = [];
  game: Game;

  constructor(game: Game) {
    this.game = game;
    this.cards.push(game.deck.drawCard());
  }

  getLastCard(): Card {
    return this.cards[this.cards.length - 1];
  }

  canPlayCard(card: Card): boolean {
    return (
      this.getLastCard().value == card.value ||
      this.getLastCard().suit == card.suit ||
      card.value == 8
    );
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
      let drawnCards = [this.game.deck.drawCard(), this.game.deck.drawCard()];
      console.log(`${nextPlayer.name} was forced to pick 2 cards`, drawnCards);
      nextPlayer.hand.cards = nextPlayer.hand.cards.concat(drawnCards);
    }
  }
}

class Hand {
  cards: Card[] = [];
  addCard(card: Card) {
    this.cards.push(card);
  }
  dropCard(cardIndex: number) {
    this.cards.splice(cardIndex, 1);
  }
}

class Player {
  hand: Hand;
  game: Game;
  name: string = "unknown";
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
   * Reaches out to `userSelectCard` function to get an index for a card
   */
  getCardIndexToPlay(): Promise<number> {
    return new Promise((resolve) =>
      userSelectCard((card) => this.game.discardPile.canPlayCard(card), resolve)
    );
  }

  /**
   * Reaches out to `userSelectSuit` function to get a new suit
   */
  pickCrazySuit(): Promise<"H" | "C" | "S" | "D"> {
    return new Promise(userSelectSuit);
  }

  /**
   * Executes whatever is necessary to run the turn
   * @param done Callback for when turn is finished
   */
  runTurn(): Promise<void> {
    return new Promise(async (resolve) => {
      console.log("Human was suppose to play");
      let cardIndex = await this.getCardIndexToPlay();
      let card = this.hand.cards[cardIndex];

      if (!card) {
        if (!this.game.deck.isEmpty) {
          console.log(`${this.name} Decided to draw a card.`);
        } else {
          console.log("Deck is empty! Rebuilding using discard pile.");
          this.game.rebuildDeck();
        }

        // Pick a new card
        let newCard = this.game.deck.drawCard();
        this.hand.addCard(newCard);
        console.log("Drew", newCard);
      } else {
        if (card.value == 8) {
          card.suit = await this.pickCrazySuit();
          console.log("An 8 was played! Changing suit to", card.suit);
        }

        this.hand.dropCard(cardIndex);
        this.game.discardPile.putCard(card);
        console.log(`${this.name} is Playing`, card);
      }

      resolve();
    });
  }

  /**
   * Runs checks before running turn and calls runTurn()
   * @param done Callback for when turn is finished
   */
  playTurn(): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.skipTurn) {
        // Skip players turn.
        console.log(`${this.name}'s turn is skipped.`);
        this.skipTurn = false;
      } else {
        await this.runTurn();
      }

      this.game.turn = (this.game.turn + 1) % this.game.players.length;
      resolve();
    });
  }
}

class BotPlayer extends Player {
  getCardIndexToPlay(): Promise<number> {
    return new Promise((resolve) => {
      let index = this.hand.cards.findIndex((card, index) =>
        this.game.discardPile.canPlayCard(card)
      );
      resolve(index);
    });
  }

  /**
   * Randomly select a new suit
   */
  pickCrazySuit(): Promise<"H" | "C" | "S" | "D"> {
    return new Promise((resolve) => {
      switch (Math.floor(Math.random() * 4)) {
        case 0:
          resolve("S");
          break;
        case 1:
          resolve("C");
          break;
        case 2:
          resolve("D");
          break;
        case 3:
          resolve("H");
          break;
      }
    });
  }

  /**
   * Bot-executed turn. Delays by 2000 and plays the first card it can.
   */
  runTurn(): Promise<void> {
    return new Promise((resolve) => {
      console.log(
        `It is ${this.name}'s turn! He has ${this.hand.cards.length} cards remaining.`,
        [].concat(this.hand.cards)
      );

      // Artificial delay before playing
      setTimeout(async (_) => {
        let cardIndex = await this.getCardIndexToPlay();
        let card = this.hand.cards[cardIndex];

        // No playable card was found
        if (!card) {
          if (!this.game.deck.isEmpty) {
            console.log(`${this.name} could not play any card. Drawing.`);
          } else {
            console.log("Deck is empty! Rebuilding using discard pile.");
            this.game.rebuildDeck();
          }

          // Pick a new card
          let newCard = this.game.deck.drawCard();
          this.hand.addCard(newCard);
          console.log("Drew", newCard);
        } else {
          if (card.value == 8) {
            card.suit = await this.pickCrazySuit();

            console.log("An 8 was played! Changing suit to", card.suit);
          }
          this.hand.dropCard(cardIndex);
          this.game.discardPile.putCard(card);
          console.log(`${this.name} is Playing`, card);
        }

        console.log(`Turn is finished, ending turn`);
        return resolve();
      }, 2000);
    });
  }
}

class Casino {
  onGameEnded: (moneyRemainingChange: number) => void;
  game: Game;
  user: User;
  betAmount: number = 0;
  hasHuman: boolean;
  renderHook: () => void = function () {};

  constructor(user: User, hasHuman: boolean = true) {
    this.user = user;
    this.hasHuman = hasHuman;
  }

  executeBet(): Promise<boolean> {
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

      let isPlayerWinner = this.game.turn == 1;
      if (isPlayerWinner) {
        this.user.moneyRemaining += this.betAmount;
      } else {
        this.user.moneyRemaining -= this.betAmount;
      }
      localStorage.setItem("bankRoll", this.user.moneyRemaining.toString());

      this.renderHook();
      resolve(isPlayerWinner);
    });
  }
}

class User {
  name: string;
  username: string;
  phoneNumber: string;
  postalCode: string;
  moneyRemaining: number;
  constructor(
    name: string,
    username: string,
    phoneNumber: string,
    postalCode: string,
    moneyRemaining: number
  ) {
    Object.assign(this, {
      name,
      username,
      phoneNumber,
      postalCode,
      moneyRemaining,
    });
  }
}
