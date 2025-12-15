const API = "https://api.exchangerate.host/convert";
const ACCESS_KEY = "016363d9b51f38bffe1927437090db5d";

const boxes = document.querySelectorAll(".box");
const boxesz = document.querySelectorAll(".minibox");

let activeSide = 0;

const statusDiv = document.createElement("div");
statusDiv.style.position = "fixed";
statusDiv.style.bottom = "0";
statusDiv.style.left = "0";
statusDiv.style.width = "100%";
statusDiv.style.background = "#f44336"; 
statusDiv.style.color = "#fff";
statusDiv.style.textAlign = "center";
statusDiv.style.padding = "10px";
statusDiv.style.fontWeight = "bold";
statusDiv.style.display = "none";
document.body.appendChild(statusDiv);

let online = navigator.onLine;

function updateInternetStatus() {
    if (navigator.onLine) {
        if (!online) {
            statusDiv.style.background = "#4caf50"; 
            statusDiv.innerText = "İnternetə qoşuldu!";
            statusDiv.style.display = "block";
            setTimeout(() => statusDiv.style.display = "none", 3000);
            convert();
        }
        online = true;
    } else {
        statusDiv.style.background = "#f44336"; 
        statusDiv.innerText = "İnternet yoxdur!";
        statusDiv.style.display = "block";
        online = false;
    }
}

function formatInput(input) {
    input.value = input.value.replace(/\./g, ",");
    input.value = input.value.replace(/[^\d,]/g, "");
    if (input.value.includes(",")) {
        const [a, b] = input.value.split(",");
        input.value = a + "," + b.slice(0, 5);
    }
}

function getCurrency(box) {
    return box.querySelector("button.active").innerText;
}

function setActive(buttons, btn) {
    buttons.forEach(b => {
        b.classList.remove("active");
        b.style.background = "white";
        b.style.color = "#C6C6C6";
    });
    btn.classList.add("active");
    btn.style.background = "#833AE0";
    btn.style.color = "#fff";
}



async function convert() {
    const fromBox = boxes[activeSide];
    const toBox = boxes[1 - activeSide];

    const fromInput = fromBox.querySelector("input");
    const toInput = toBox.querySelector("input");

    const fromCur = getCurrency(fromBox);
    const toCur = getCurrency(toBox);

    const amount = parseFloat(fromInput.value.replace(",", ".")) || 0;

    if (!online) {
        if (fromCur === toCur) {
            toInput.value = fromInput.value;
        } else {
            toInput.value = toInput.value || "0,00000";
        }

        fromBox.querySelector(".minibox .valyuta").innerText =
            fromCur === toCur ? `1 ${fromCur} = 1 ${toCur}` : fromBox.querySelector(".minibox .valyuta").innerText || `1 ${fromCur} = ? ${toCur}`;

        toBox.querySelector(".minibox .valyuta").innerText =
            fromCur === toCur ? `1 ${toCur} = 1 ${fromCur}` : toBox.querySelector(".minibox .valyuta").innerText || `1 ${toCur} = ? ${fromCur}`;

        return;
    }

    const url = `${API}?from=${fromCur}&to=${toCur}&amount=${amount}&access_key=${ACCESS_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        toInput.value = (data.result || 0).toFixed(5).replace(".", ",");

        fromBox.querySelector(".minibox .valyuta").innerText =
            `1 ${fromCur} = ${data.info.rate.toFixed(5)} ${toCur}`;
        toBox.querySelector(".minibox .valyuta").innerText =
            `1 ${toCur} = ${(1 / data.info.rate).toFixed(5)} ${fromCur}`;
    } catch (err) {
        console.log("API xətası:", err);
    }
}

boxes.forEach((box, index) => {
    const input = box.querySelector("input");
    const buttons = box.querySelectorAll("button");

    const leftButtons = boxes[0].querySelectorAll("button");
    setActive(leftButtons, leftButtons[0]);

    const rightButtons = boxes[1].querySelectorAll("button");
    setActive(rightButtons, rightButtons[0]);

    activeSide = 0;

    input.addEventListener("input", () => {
        formatInput(input);
        activeSide = index; 
        convert();
    });

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            setActive(buttons, btn);
            convert();
        });
    });
});

window.addEventListener("online", updateInternetStatus);
window.addEventListener("offline", updateInternetStatus);

updateInternetStatus();




