const wait = ms => new Promise(res => setTimeout(res, ms));
const nextButton = document.getElementById('nextButton');
const menuBar = document.getElementById('menuBar');

async function showButton() {
    while (true) {
        await wait(500);
        if (menuBar.getBoundingClientRect().top <= 0) {
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = null;
        } else {
            nextButton.style.opacity = '0';
            nextButton.style.pointerEvents = 'none';
        }
    }
}

showButton();