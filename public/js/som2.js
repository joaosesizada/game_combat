const audio = new Audio('../aud/lobby.mp3')
audio.volume = 0.3;

window.addEventListener('keyup', () => {
    audio.play();
});

window.document.addEventListener('click', () => {
    audio.play();
});

window.addEventListener('load', () => {
    audio.play();
});

window.document.addEventListener('resize', () => {
    audio.play();
});

window.document.addEventListener('change', () => {
    audio.play();
});