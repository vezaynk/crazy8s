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
            ${card.value <= 10 ? Array(card.value).fill('<span>' + entity + '</span>').join("") : `<span>${entity}</span><span>${letter}</span>`}
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
                <a id="showInfoBox" href="#">${casino.game.players[casino.game.turn].name}</a>'s turn |</span>
            <span>Bet: ${casino.betAmount}$ |</span>
            <span>Pick a card</span>
        </p>
    </div>
</div>`;
    let elShowInfoBox = elTopBar.querySelector("#showInfoBox");
    let elInfoBox = renderInfoBox(casino.user);
    elInfoBox.classList.toggle("hidden");
    elShowInfoBox.addEventListener("click", function () {
        elInfoBox.classList.toggle("hidden");
    });
    elInfoBox.addEventListener("click", function () {
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
    el.classList.add("deck");
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
function renderSuitSelector() {
    let el = document.createElement('div');
    el.classList.add('modal');
    el.innerHTML = `
        <div class="modal-contents">
        <h1> Crazy 8 </h1>
        <h2> Select the new suit </h2>
        <button class="selector">&spades;</button>
        <button class="selector">&clubs;</button>
        <button class="selector">&diams;</button>
        <button class="selector">&hearts;</button>
        <p>The card will take the suit of the one selected above</p>
        </div>
    `;
    return el;
}
function renderView(root, casino) {
    root.innerHTML = "";
    // Render info boxes and header
    root.appendChild(renderHeader(casino));
    // Render everything else
    let handPlayer = renderTable(casino);
    handPlayer.children.item(0).id = "hand-bot";
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
        });
    });
    let deck = root.querySelector(".deck .card.back-side");
    deck.addEventListener('click', function () {
        resolve(-1);
    });
}
function userSelectSuit(resolve) {
    let el = renderSuitSelector();
    [...el.querySelectorAll(".selector")].forEach((s, i) => {
        s.addEventListener("click", function () {
            switch (i) {
                case 0:
                    resolve('S');
                    break;
                case 1:
                    resolve('C');
                    break;
                case 2:
                    resolve('D');
                    break;
                case 3:
                    resolve('H');
                    break;
            }
        });
    });
    root.appendChild(el);
}
//# sourceMappingURL=interface.js.map