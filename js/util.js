'use strict'
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board.length; j++) {
            var strData = `data-i="${i}" data-j="${j}"`;
            strHTML += `<td class="covered" ${strData} 
                        onmouseup="cellClicked(this, dataset.i, dataset.j, event)" , 
                        oncontextmenu="event.preventDefault()">
                        </td>`
        }
        strHTML += `</tr>`;
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function revealCell(elCell, i, j) {
    elCell.classList.remove('covered')
    elCell.classList.add('revealed')
    var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
    if (cell.isMine) {
        renderCell({i: i,j: j}, MINE);
    } else {
        elCell.innerText = cell.minesAroundCount;
        cell.isShown = true;
        gGame.shownCount++;
        if (elCell.innerText === '0') {
            expandShown(elCell.dataset.i, elCell.dataset.j);
        }
    }
}

function renderCell(pos, value) {
    var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`);
    elCell.innerText = value;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cellsToAMap(board) {
    gCellMap = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            gCellMap[board[i][j].id] = board[i][j];
        }
    }
}

function startTimer() {
    gStartTime = Date.now();
    gGameInterval = setInterval(displayTimer, 300);
    console.log(gStartTime);
    
}

function stopTimer() {
    clearInterval(gGameInterval);
}

function displayTimer() {
    var timePassed = Date.now() - gStartTime;
    var seconds = parseInt(timePassed / 1000);
    if (seconds < 10) seconds = ('0' + seconds);
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = seconds;
}

function resetTimer() {
    stopTimer();
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '00';
}