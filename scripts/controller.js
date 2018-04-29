let root = document.querySelector("body");
let qArray = location.search
    .substring(1)
    .split("&")
    .reduce((a, b) => {
    let pair = b.split("=").map(decodeURIComponent);
    a[pair[0]] = pair[1].split("+").join(" ");
    return a;
}, {});
let monkeyUser = new User(qArray.firstName + " " + qArray.lastName, qArray.username, qArray.phoneNum, qArray.pCode, +qArray.bankRoll);
(function playGame() {
    // Ran out of money. Bye bye!
    if (!monkeyUser.moneyRemaining)
        return root.appendChild(renderThankYouModal(monkeyUser));
    let casino = new Casino(monkeyUser, true);
    casino.renderHook = function () {
        renderView(root, casino);
        window.scrollTo(0, document.body.scrollHeight);
    };
    root.appendChild(renderBettingMenu(monkeyUser, (betAmount) => {
        casino.betAmount = betAmount;
        casino.executeBet().then(isWinner => {
            revealOpponentCards();
            let modal = renderEndGameMenu(isWinner, betAmount, playGame, function () {
                casino.renderHook();
                root.appendChild(renderThankYouModal(monkeyUser));
            });
            root.appendChild(modal);
        });
    }));
})();
//# sourceMappingURL=controller.js.map