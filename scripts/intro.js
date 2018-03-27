let elFirst = document.querySelector("#first");
let elLast = document.querySelector("#last");
let elUsername = document.querySelector("#username");
let elPhone = document.querySelector("#phone");
let elPostal = document.querySelector("#postal");
let elMoney = document.querySelector("#money");
let elForm = document.querySelector("form");
// Refreshing breaks state
elFirst.value = "";
elLast.value = "";
elUsername.value = "";
elPhone.value = "";
elPostal.value = "";
elMoney.value = "";
elFirst.addEventListener('change', function (e) {
    const value = this.value;
    let isValid = true;
    // First character must be letter
    if (!/^[a-zA-Z]/.test(value))
        isValid = false;
    // Must be no more than 20 characters
    if (value.length > 20)
        isValid = false;
    // May only contain letters, spaces, dashes and single quotes
    if (!/^([a-zA-Z]| |-|')+$/.test(value))
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "First name can only contain letters, space, single quote or dash. It must start with a letter.  It is a maximum of 20 characters long.";
    }
});
elLast.addEventListener('change', function (e) {
    const value = this.value;
    let isValid = true;
    // First character must be letter
    if (!/^[a-zA-Z]/.test(value))
        isValid = false;
    // Must be no more than 20 characters
    if (value.length > 20)
        isValid = false;
    // May only contain letters, spaces, dashes and single quotes
    if (!/^([a-zA-Z]| |-|')+$/.test(value))
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "First name can only contain letters, space, single quote or dash. It must start with a letter.  It is a maximum of 30 characters long.";
    }
});
elUsername.addEventListener('change', function (e) {
    const value = this.value;
    let isValid = true;
    if (!/^[a-z][0-9]{3}[A|B]$/.test(value))
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "Username must start with a lower case letter, followed by three digits and finally either an uppercase A or B";
    }
});
elPhone.addEventListener('change', function (e) {
    const value = this.value;
    let isValid = true;
    if (!/^([0-9]{3}.){2}[0-9]{4}$/.test(value) && !/^(\([0-9]{3}\)) [0-9]{3}-[0-9]{4}$/.test(value))
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "Phone number must be in the format (###) ###-#### or ###.###.####. ";
    }
});
elPostal.addEventListener('keyup', function (e) {
    elPostal.value = elPostal.value.toUpperCase();
});
elPostal.addEventListener('change', function (e) {
    const value = this.value;
    let isValid = true;
    if (!/^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/.test(value))
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "Postal code must be in the format ANA NAN.";
    }
});
elMoney.addEventListener('change', function (e) {
    const value = +this.value;
    let isValid = true;
    // Must be a number
    if (isNaN(value))
        isValid = false;
    // Must be between 5 and 5000
    if (value > 5000 || value < 5)
        isValid = false;
    // Must be whole number
    if (Math.round(value) != value)
        isValid = false;
    this.className = "";
    this.parentElement.querySelector(".error").textContent = "";
    if (isValid) {
        this.classList.add("valid");
    }
    else {
        this.classList.add("invalid");
        this.parentElement.querySelector(".error").textContent = "Postal code must be in the format ANA NAN.";
    }
});
elForm.addEventListener("submit", function (e) {
    // Trigger change events
    let validInputs = this.querySelectorAll(".field input.valid");
    let allInputs = this.querySelectorAll(".field input");
    [...allInputs].forEach(i => i.dispatchEvent(new Event("change")));
    if (validInputs.length != allInputs.length)
        e.preventDefault();
});
//# sourceMappingURL=intro.js.map