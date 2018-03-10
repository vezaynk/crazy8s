var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        // populates deck
        this.cards = Array(52).fill(0).map(function (_, i) {
            // Cards will be broken up into 4 suits.
            // nSuit = 0: Clubs
            //       = 1: Hearts
            //       = 2: Diamonds
            //       = 3: Spades
            var nSuit = Math.floor(i / 13);
            // Actual value of the card
            var value = i % 13 + 1;
            var newCard = { suit: "S", value: value };
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
    Deck.prototype.drawCard = function () {
        var drawnCard = this.cards.pop();
        return drawnCard;
    };
    /**
     * Adds a card to the deck
     * @param card Card to add to the deck
     * @param allowDuplicate Allows insertion of duplicate card, default false
     * @returns Returns true if card was added to deck
     */
    Deck.prototype.addCard = function (card, allowDuplicate) {
        if (allowDuplicate === void 0) { allowDuplicate = false; }
        var cardAlreadyInDeck = this.cards.some(function (c) {
            return c.suit == card.suit || c.value == card.value;
        });
        if (cardAlreadyInDeck && !allowDuplicate) {
            return false;
        }
        this.cards.unshift(card);
        return true;
    };
    Object.defineProperty(Deck.prototype, "isEmpty", {
        /**
         * Checks if deck is empty
         * @returns false if deck has at least 1 card left, true if empty
         */
        get: function () {
            return !this.cards.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Shuffles the deck's cards
     * @param n Number of shuffles
     */
    Deck.prototype.shuffleDeck = function (n) {
        if (n === void 0) { n = 1; }
        for (var shuffles = 0; shuffles <= n; shuffles++) {
            for (var i = this.cards.length - 1; i > 0; i--) {
                var randomIndex = Math.floor(Math.random() * (i + 1));
                var tmpCard = this.cards[i];
                this.cards[i] = this.cards[randomIndex];
                this.cards[randomIndex] = tmpCard;
            }
        }
    };
    return Deck;
}());
var Game = /** @class */ (function () {
    // This is magical. To avoid having a game which depends on instances of players who depend on an instance of game
    // The game constructor depends of an array of player constructors. I did not think it was possible, but it seems it is!
    function Game(playerConstructors) {
        var _this = this;
        this.deck = new Deck();
        this.discardPile = new DiscardPile(this);
        this.turn = -1;
        this.deck.shuffleDeck(12);
        console.log(this.deck.cards);
        this.players = playerConstructors.map(function (playerConstructor) { return new playerConstructor(_this); });
        // Temporary, give the players names
        this.players.forEach(function (player, index) {
            player.name = "Player " + index;
        });
        this.nextTurn();
    }
    Game.prototype.nextTurn = function () {
        this.turn = (this.turn + 1) % this.players.length;
        var currentPlayer = this.players[this.turn];
        currentPlayer.playTurn();
    };
    Game.prototype.rebuildDeck = function () {
        // set deck to all cards except last one
        this.deck.cards = this.discardPile.cards.filter(function (c, index, cards) {
            return (index + 1 != cards.length);
        });
        // Reshuffling cards
        this.deck.shuffleDeck();
        // Set discard pile cards to the last one
        this.discardPile.cards = [this.discardPile.getLastCard()];
        // Good to go!
    };
    return Game;
}());
var DiscardPile = /** @class */ (function () {
    function DiscardPile(game) {
        this.cards = [];
        this.cards.push(game.deck.drawCard());
    }
    DiscardPile.prototype.getLastCard = function () {
        return this.cards[this.cards.length - 1];
    };
    DiscardPile.prototype.canPlayCard = function (card) {
        return this.getLastCard().value == card.value
            || this.getLastCard().suit == card.suit;
    };
    DiscardPile.prototype.putCard = function (card) {
        this.cards.push(card);
    };
    return DiscardPile;
}());
var Hand = /** @class */ (function () {
    function Hand() {
        this.cards = [];
    }
    Hand.prototype.addCard = function (card) {
        this.cards.push(card);
    };
    Hand.prototype.dropCard = function (cardIndex) {
        this.cards.splice(cardIndex, 1);
    };
    return Hand;
}());
var Player = /** @class */ (function () {
    function Player(game) {
        this.name = "unknown";
        this.hand = new Hand();
        this.game = game;
        // Populate hand with 8 cards
        for (var i = 0; i < 8 && !game.deck.isEmpty; i++) {
            this.hand.addCard(game.deck.drawCard());
        }
    }
    Player.prototype.playTurn = function () {
    };
    return Player;
}());
var BotPlayer = /** @class */ (function (_super) {
    __extends(BotPlayer, _super);
    function BotPlayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BotPlayer.prototype.playTurn = function () {
        var _this = this;
        var playedCard = this.hand.cards.find(function (card, index) {
            if (_this.game.discardPile.canPlayCard(card)) {
                if (card.value == 8) {
                    card.suit = "H";
                }
                _this.hand.dropCard(index);
                _this.game.discardPile.putCard(card);
                console.log(_this.name + " is Playing", card);
                return true;
            }
            return false;
        });
        if (!playedCard) {
            if (!this.game.deck.isEmpty) {
                console.log(this.name + " could not play any card. Drawing.");
            }
            else {
                console.log("Deck is empty! Using discard pile.");
                this.game.rebuildDeck();
            }
            this.hand.addCard(this.game.deck.drawCard());
        }
        console.log(this.name + " turn is finished, ending turn");
        if (this.hand.cards.length) {
            console.log(this.name + " has " + this.hand.cards.length + " cards remaining");
            this.game.nextTurn();
        }
        else {
            // Game over. Victory.
            console.log(this.name + " ran out of cards. Victory!");
        }
    };
    return BotPlayer;
}(Player));
var game = new Game([BotPlayer, BotPlayer, BotPlayer]);
