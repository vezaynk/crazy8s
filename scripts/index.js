$(function () {
    let canvas = document.getElementById("canvas");
    for (let index = 0; index < 100; index++) {
        document.querySelector(".card-fancy-container").appendChild(renderCard({ suit: 'H', value: 1 }, true));
    }
    function flipCard($card) {
        if ($card.hasClass("back-side")) {
            $card.removeClass("back-side").addClass("front-side");
        }
        else {
            $card.removeClass("front-side").addClass("back-side");
        }
    }
    function flipCardContinously($card) {
        flipCard($card);
        return setInterval(function () {
            flipCard($card);
        }, 5000);
    }
    function flipCards() {
        $(".card").each(function (index) {
            setTimeout(() => {
                let interval = flipCardContinously($(this));
                setTimeout(() => { clearInterval(interval); }, 5000 * 2);
            }, index * 50);
        });
        // setTimeout(canvasAnimation, $(".cards").length * 50 + 5000 * 2)
    }
    flipCards();
    canvasAnimation();
    async function canvasAnimation() {
        $(".card-fancy-container").fadeOut("slow");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const partW = canvas.width / 7;
        const partH = canvas.height / 4;
        let squares = [Array(7).fill(''), ['', 'C', 'R', 'A', 'Z', 'Y', ''], ['', '', '8', 's', '', '', ''], Array(7).fill('')];
        let ctx = canvas.getContext("2d");
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        let paintSquaresBlack = squares.map((row, rowi) => row.map((cell, celli) => {
            let fill = () => { ctx.fillRect(celli * partW, rowi * partH, partW, partH); };
            if (cell) {
                ctx.font = "30px Arial";
                return () => {
                    fill();
                    ctx.fillStyle = "white";
                    ctx.fillText(cell, celli * partW + (partW / 2), rowi * partH + (partH / 2), partW);
                    ctx.fillStyle = "black";
                };
            }
            else {
                return fill;
            }
        }));
        paintSquaresBlack.forEach((row, i) => row.forEach((paintCell, pci) => {
            setTimeout(() => {
                ctx.fillStyle = "black";
                paintCell();
            }, 300 * (i * paintSquaresBlack[0].length + pci));
        }));
        let paintSquaresWhite = squares.map((row, rowi) => row.map((cell, celli) => {
            let fill = () => { ctx.fillRect(celli * partW, rowi * partH, partW, partH); };
            if (cell) {
                ctx.font = "30px Arial";
                return () => {
                    fill();
                    ctx.fillStyle = "black";
                    ctx.fillText(cell, celli * partW + (partW / 2), rowi * partH + (partH / 2), partW);
                    ctx.fillStyle = "white";
                };
            }
            else {
                return fill;
            }
        }));
        paintSquaresWhite.forEach((row, i) => row.forEach((paintCell, pci) => {
            setTimeout(() => {
                ctx.fillStyle = "white";
                paintCell();
            }, 300 * (i * paintSquaresWhite[0].length + pci) + 5000);
        }));
    }
});
//# sourceMappingURL=index.js.map