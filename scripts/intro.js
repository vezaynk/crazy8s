let elFirst = document.querySelector("#firstName");
let elLast = document.querySelector("#lastName");
let elUsername = document.querySelector("#username");
let elPhone = document.querySelector("#phoneNum");
let elPostal = document.querySelector("#pCode");
let elMoney = document.querySelector("#bankRoll");
let elForm = document.querySelector("form");
// Refreshing breaks state
let allInputs = (document.querySelector("form").querySelectorAll(".field input"));
// @ts-ignore
$("#slider").slider({
    range: "min",
    value: 100,
    step: 1,
    min: 5,
    max: 5000,
    slide: function (event, ui) {
        $(elMoney).val(ui.value);
    },
});
// @ts-ignore
$("form").validate({
    rules: {
        firstName: {
            pattern: /^[a-zA-Z]([a-zA-Z]| |-|')*$/,
            maxlength: 20,
            required: true,
        },
        lastName: {
            pattern: /^[a-zA-Z]([a-zA-Z]| |-|')*$/,
            maxlength: 20,
            required: true,
        },
        username: {
            pattern: /^[a-z][0-9]{3}[A|B]$/,
        },
        phoneNum: {
            pattern: /^(([0-9]{3}.){2}[0-9]{4})|((\([0-9]{3}\)) [0-9]{3}-[0-9]{4})$/,
        },
        pCode: {
            pattern: /^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/,
        },
    },
    messages: {
        firstName: {
            pattern: "First character must be letter and  May only contain letters, spaces, dashes and single quotes",
            required: "First name is required",
            maxlength: "Must be no more than 20 characters",
        },
        lastName: {
            pattern: "First character must be letter and  May only contain letters, spaces, dashes and single quotes",
            required: "First name is required",
            maxlength: "Must be no more than 20 characters",
        },
        username: {
            pattern: "Username must start with a lower case letter, followed by three digits and finally either an uppercase A or B",
        },
        phoneNum: {
            pattern: "Phone number must be in the format (###) ###-#### or ###.###.####. ",
        },
        pCode: {
            pattern: "Postal code must be in the format ANA NAN.",
        },
    },
    submitHandler: function (form) {
        // do other things for a valid form
        form.submit();
    },
});
elPostal.addEventListener("keyup", function (e) {
    elPostal.value = elPostal.value.toUpperCase();
});
elForm.addEventListener("submit", function (e) {
    // Trigger change events
    let validInputs = this.querySelectorAll(".field input.valid");
    let allInputs = (this.querySelectorAll(".field input"));
    [...allInputs].forEach((i) => i.dispatchEvent(new Event("change")));
    if (validInputs.length != allInputs.length)
        return e.preventDefault();
    // Save all fields to LocalSotrage
    [...allInputs]
        .map((input) => ({ key: input.id, value: input.value }))
        .forEach((item) => {
        localStorage.setItem(item.key, item.value);
    });
});
if (location.search != "?change") {
    elFirst.value = localStorage.getItem("firstName");
    elLast.value = localStorage.getItem("lastName");
    elUsername.value = localStorage.getItem("username");
    elPhone.value = localStorage.getItem("phoneNum");
    elPostal.value = localStorage.getItem("pCode");
    elMoney.value = localStorage.getItem("bankRoll");
    let complete = [...allInputs].every((i) => {
        if (i.value) {
            i.dispatchEvent(new Event("change"));
            return true;
        }
    });
    if (complete)
        document.getElementById("btn").click();
}
else {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("username");
    localStorage.removeItem("phoneNum");
    localStorage.removeItem("pCode");
    localStorage.removeItem("bankRoll");
    localStorage.removeItem("lastVisit");
}
$(elMoney).val(100);
//# sourceMappingURL=intro.js.map