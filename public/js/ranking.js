let tierList = []

window.onload = function () {
    fetch('https://eternalnexus.online/ranking')
        .then(response => response.json())
        .then(data => {
            let ranking = document.getElementById('ranking');
            let i = 1
            data.forEach(user => {
                console.log(user)
                let list = [ i, user.username, user.victory, user.lose, user.photo_user ]
                tierList.push(list);
                i++
            });
            console.log(tierList);
            createRanking()
        })
        .catch(error => console.error('Error:', error));
};
      
let ouroIcone = document.getElementById('tier1-icone');
let ouroName = document.getElementById('tier1-name');
let ouroVictory = document.getElementById('tier1-victory');
let ouroLose = document.getElementById('tier1-lose');

let prataIcone = document.getElementById('tier2-icone');
let prataName = document.getElementById('tier2-name');
let prataVictory = document.getElementById('tier2-victory');
let prataLose = document.getElementById('tier2-lose');

let bronzeIcone = document.getElementById('tier3-icone');
let bronzeName = document.getElementById('tier3-name');
let bronzeVictory = document.getElementById('tier3-victory');
let bronzeLose = document.getElementById('tier3-lose');

function createRanking() {
    ouroIcone.src = "./imgs/icones/"+tierList[0][4]+".png"
    ouroName.innerHTML = tierList[0][1]
    ouroVictory.innerHTML = tierList[0][2]
    ouroLose.innerHTML = tierList[0][3]

    prataIcone.src = "./imgs/icones/"+tierList[1][4]+".png"
    prataName.innerHTML = tierList[1][1]
    prataVictory.innerHTML = tierList[1][2]
    prataLose.innerHTML = tierList[1][3]

    bronzeIcone.src = "./imgs/icones/"+tierList[2][4]+".png"
    bronzeName.innerHTML = tierList[2][1]
    bronzeVictory.innerHTML = tierList[2][2]
    bronzeLose.innerHTML = tierList[2][3]

    for(let i = 3; i < tierList.length; i++) {
        console.log(i)
        document.getElementById(`tier${i+1}-name`).innerHTML = tierList[i][1]
        document.getElementById(`tier${i+1}-victory`).innerHTML = tierList[i][2]
    }
}