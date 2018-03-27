function renderCard(card: Card, faceUp: boolean) {
    // Determine primary color
    let color: "red" | "black" = "black"
    if (card.suit == 'H' || card.suit == 'D')
        color = "red"

    // Determine card text
    let text = "";
    let letter = card.value.toString();
    // Determine corner text and letter
    switch (card.value) {
        case 1:
            text = "One of "
            letter = "A";
            break;
        case 2:
            text = "Two of "
            break;
        case 3:
            text = "Three of "
            break;
        case 4:
            text = "Four of "
            break;
        case 5:
            text = "Five of "
            break;
        case 6:
            text = "Six of "
            break;
        case 7:
            text = "Seven of "
            break;
        case 8:
            text = "Eight of "
            break;
        case 9:
            text = "Nine of "
            break;
        case 10:
            text = "Ten of "
            break;
        case 11:
            text = "Jack of "
            letter = "J";
            break;
        case 12:
            text = "Queen of "
            letter = "Q";
            break;
        case 13:
            text = "King of "
            letter = "K";
            break;
    }

    let entity = "";
    switch (card.suit) {
        case 'H':
            text += "Hearts"
            entity = "&hearts;"
            break;

        case 'C':
            text += "clubs"
            entity = "&clubs;"
            break;

        case 'D':
            text += "Diamonds"
            entity = "&diams;"
            break;

        case 'S':
            text += "Spades"
            entity = "&spades;"
            break;

    }

    let el = document.createElement('div');
    el.setAttribute("data-suit", card.suit);
    el.setAttribute("data-value", card.value.toString());

    el.className = `card ${faceUp ? 'front-side' : 'back-side'} ${color}`
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
    `)
    el.innerHTML = html;

    return el;
}

function renderHand(hand: Hand, faceUp: boolean) {
    let elHand = document.createElement('section');
    elHand.className = "hand";
    hand.cards.forEach(card => elHand.appendChild(renderCard(card, faceUp)));

    return elHand;
}

function renderHeader(casino: Casino) {
    let elInfo = document.createElement("div");

    let elTopBar = document.createElement("div")
    elTopBar.className = "userInfo"
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


    elInfoBox.classList.toggle("hidden")

    elShowInfoBox.addEventListener("click", function () {
        elInfoBox.classList.toggle("hidden")
    })

    elInfoBox.addEventListener("click", function () {
        elInfoBox.classList.toggle("hidden")
    })

    elInfo.appendChild(elTopBar);
    elInfo.appendChild(elInfoBox)

    return elInfo;
}

function renderInfoBox(user: User) {
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
`
    return el;
}

function renderDeck(topCard: Card) {
    let el = document.createElement("section")
    el.classList.add("deck");

    el.appendChild(renderCard(topCard, false));
    el.appendChild(renderCard(topCard, true));

    return el;
}

function renderTable(casino: Casino) {
    let el = document.createElement("div");
    el.className = "container"


    // Render opponent deck
    el.appendChild(renderHand(casino.game.players[1].hand, false))

    // Render shared deck
    el.appendChild(renderDeck(casino.game.discardPile.cards[casino.game.discardPile.cards.length - 1]))

    // Render player deck
    el.appendChild(renderHand(casino.game.players[0].hand, true))

    return el;
}

function renderSuitSelector() {
    let el = document.createElement('div')
    el.innerHTML = `
        <h1> Crazy 8 Played!</h1>
        <h2> Select the new suit </h2>
        <button class="selector">&spades;</button>
        <button class="selector">&clubs;</button>
        <button class="selector">&diams;</button>
        <button class="selector">&hearts;</button>
        <p>The card will take the suit of the one selected above</p>
    `
    return renderModal(el);
}


function renderEndGameMenu(win:boolean, betAmount:number, playAgain:()=>void, leave:()=>void) {
    let el = document.createElement('div')
    el.innerHTML = `
    <h1>${win ? "Victory!" : "Lost!"}</h1>
    <h2>You have ${win ? "Won" : "Lost"} ${betAmount}$</h2>
    <button class="replay">Play Again!</button>
    <button class="leave">Leave</button>
    `
    el.querySelector(".replay").addEventListener("click", playAgain)
    el.querySelector(".leave").addEventListener("click", leave)
    return renderModal(el);
}

function renderThankYouModal(user: User) {
    let el = document.createElement('div')
    el.innerHTML = `
    <h1>Thanks ${user.name} for visiting!</h1>
    <h2>You have now have ${user.moneyRemaining}$</h2>
    <a href="./intro.html">Go to intro page</a>
    `
    return renderModal(el);
}

function renderModal(modalContents: Element) {

    let el = document.createElement('div')
    el.classList.add('modal')
    modalContents.classList.add('modal-contents')
    el.appendChild(modalContents);
    return el;
}


function renderBettingMenu(user: User, submitCb: (amount: number) => void) {
    let el = document.createElement('div')
    el.innerHTML = `
        <h2>The Happy Gambler Presents...</h2>
        <h1> Crazy 8s</h1>
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
    <hr>
        <h2> Make a bet </h2>
        <input type="number">
        <button>Place bet</button>
        <p>Your bet will either be doubled on a win condition or lost on a loss.</p>
        <p>The bet has to be less than your total holdings ($${user.moneyRemaining})</p>
        <p class="error"></p>
    `

    let input = el.querySelector("input");
    let btn = el.querySelector("button");
    let error = el.querySelector(".error");
    btn.addEventListener('click', function () {
        let isValid = true;
        if (isNaN(+input.value) || +input.value <= 0 || +input.value > user.moneyRemaining)
            isValid = false;

        if (!isValid)
            error.textContent = "Invalid bet.";
        else
            submitCb(+input.value);
    })
    return renderModal(el);
}

function renderView(root: Element, casino: Casino) {
    root.innerHTML = "";

    // Render info boxes and header
    root.appendChild(renderHeader(casino));

    // Render everything else
    let handPlayer = renderTable(casino);
    handPlayer.children.item(0).id = "hand-bot";
    handPlayer.children.item(2).id = "hand-player";
    root.appendChild(handPlayer);
}

function revealOpponentCards() {
    [...root.querySelectorAll("#hand-bot .card")].forEach(card=>{
        card.classList.remove("back-side")
        card.classList.add("front-side")
    })
}

function userSelectCard(playCheck:(card:Card)=>boolean, resolve) {
    let cards = [...root.querySelectorAll("#hand-player .card")];
    cards.forEach((elCard, index) => {

        elCard.addEventListener("click", function () {
            let playable = playCheck({
                suit: this.getAttribute("data-suit"),
                value: +this.getAttribute("data-value")
            })

            if (playable)
                resolve(index)
        })

    })

    let deck = root.querySelector(".deck .card.back-side");

    deck.addEventListener('click', function () {
        resolve(-1);
    })
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
        })
    })
    root.appendChild(el);
}

