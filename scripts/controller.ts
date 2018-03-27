
let root = document.querySelector("body");

let qArray: any = location.search
    .substring(1)
    .split("&")
    .reduce((a, b) => {
        let pair = b.split("=").map(decodeURIComponent);
        a[pair[0]] = pair[1].split("+").join(" ")
        return a;
    }, {})

let monkeyUser = new User(qArray.first + " " + qArray.last, qArray.username, qArray.phone, qArray.postal, +qArray.money);

(function playGame() {
    // Ran out of money. Bye bye!
    if (!monkeyUser.moneyRemaining)
        return root.appendChild(renderThankYouModal(monkeyUser))

    let casino = new Casino(monkeyUser, true);

    casino.renderHook = function () {
        renderView(root, casino);
    }

    root.appendChild(renderBettingMenu(monkeyUser, (betAmount) => {
        casino.betAmount = betAmount;
        casino.executeBet().then(isWinner => {
            revealOpponentCards();
            let modal = renderEndGameMenu(isWinner, betAmount, playGame, function () {
                casino.renderHook();
                root.appendChild(renderThankYouModal(monkeyUser))
            });

            root.appendChild(modal)
        });
    }));
})();