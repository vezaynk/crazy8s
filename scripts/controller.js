let root = document.querySelector("body");
let qArray = location.search
    .substring(1)
    .split("&")
    .reduce((a, b) => {
    let pair = b.split("=").map(decodeURIComponent);
    a[pair[0]] = pair[1].split("+").join(" ");
    return a;
}, {});
let monkeyUser = new User(qArray.first + " " + qArray.last, qArray.username, qArray.phone, qArray.postal, qArray.money);
let casino = new Casino(monkeyUser, true);
casino.betAmount = 30;
casino.renderHook = function () {
    renderView(root, casino);
};
casino.executeBet().then(isWinner => {
});
//# sourceMappingURL=controller.js.map