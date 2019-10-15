'use strict'
// Global constants = 

const MINE = '💣';
const FLAG = '⚑';
const SMILEY = '😃';
const LOSE_SMILEY = '😞';
const WIN_SMILEY = '😎';

var gBoard;
var gLevel = {
    size: 4,
    mines: 2,
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
}

var gMineLocations;
var gCellMap;
var gGameInterval;
var gStartTime;
var gSafeCount;

function init() {
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secPassed = 0;
    gSafeCount = 3;
    resetTimer();
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard);
    changeSmileyFace(SMILEY);
    setSafeClickBtn();
}

function buildBoard(boardLength) {
    var board = [];
    for (var i = 0; i < boardLength; i++) {
        board.push([]);
        for (var j = 0; j < boardLength; j++) {
            board[i][j] = {
                id: i * boardLength + j,
                minesAroundCount: 0,
                location: {
                    i: i,
                    j: j,
                },
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    cellsToAMap(board);
    return board;
}

function resetGame(boardSize) {
    gLevel.size = boardSize;
    if (gLevel.size === 4) gLevel.mines = 2;
    if (gLevel.size === 8) gLevel.mines = 12;
    if (gLevel.size === 12) gLevel.mines = 30;
    init();
}

function determineMinesLocation(elCell) {
    var mineNum = gLevel.mines
    var clickedCell = gBoard[elCell.dataset.i][elCell.dataset.j];
    gMineLocations = [];
    for (var i = 0; gMineLocations.length < mineNum; i++) {
        var posI = getRandomIntInclusive(0, gBoard.length - 1);
        var posJ = getRandomIntInclusive(0, gBoard.length - 1);
        var location = gBoard[posI][posJ];
        if (gMineLocations.includes(location) || location === clickedCell) {
            continue;
        } else {
            gMineLocations.push(location);
            location.isMine = true;
            setMinesNegsCount(gBoard, posI, posJ);
        }
    }
}

function setMinesNegsCount(board, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === posI && j === posJ) continue;
            else board[i][j].minesAroundCount++;
        }
    }
}

function cellClicked(elCell, i, j, ev) {
    if (!gGame.isOn) {
        if (gGame.shownCount === 0) {
            firstClick(elCell, i, j, ev);
        } else return;
    }
    else if (elCell.classList.contains('revealed')) return;
    else if (ev.button === 2) {
        cellMarked(elCell);
        checkGameOver(elCell);
    }
    else if (elCell.innerText === FLAG) return;
    else {
        revealCell(elCell, i, j);
        checkGameOver(elCell);
    }
    displayTimer();
}


function firstClick(elCell, i, j, ev) {
    gGame.isOn = true
    determineMinesLocation(elCell)
    startTimer();
    if (ev.button === 2) {
        cellMarked(elCell);
    } else {
        revealCell(elCell, i, j);
    }
    displayTimer();
}

function cellMarked(elCell) {
    if (elCell.classList.contains('revealed')) return;
    else if (elCell.innerText === FLAG) elCell.innerText = '';
    else {
        elCell.innerText = FLAG;
        gGame.markedCount++;
    }
}

function checkGameOver(elCell) {
    if (elCell.innerText === MINE) {
        stopTimer()
        gGame.isOn = false;
        changeSmileyFace(LOSE_SMILEY);
        for (var i = 0; i < gMineLocations.length; i++) {
            var cellId = gMineLocations[i].id;
            var mineCell = gCellMap[cellId];
            var elMineCell = document.querySelector(`[data-i="${mineCell.location.i}"]` +
                                                    `[data-j="${mineCell.location.j}"]`);
            var elMinePosI = elMineCell.dataset.i
            var elMinePosJ = elMineCell.dataset.j
            revealCell(elMineCell, elMinePosI, elMinePosJ);
        }
    } else if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) {
        stopTimer()
        gGame.isOn = false;
        changeSmileyFace(WIN_SMILEY);
    }
}

function expandShown(i, j) {
    var posI = +i;
    var posJ = +j;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            var elExpCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            if (elExpCell.classList.contains('revealed')) continue;
            if (elExpCell.innerText === FLAG) continue;
            else revealCell(elExpCell, i, j);
        }
    }
}

function showSafeClick() {
    if (gSafeCount !== 0) {
        var safeCell = {};
        var idx = getRandomIntInclusive(0, gCellMap.length - 1)
        if (gCellMap[idx].isMine || gCellMap[idx].isShown) {
            showSafeClick();
        } else {
            gSafeCount--;
            setSafeClickBtn();
            safeCell = gCellMap[idx];
            var safePosI = safeCell.location.i;
            var safePosJ = safeCell.location.j;
            var elCell = document.querySelector(`[data-i="${safePosI}"]` +
                                                `[data-j="${safePosJ}"]`);
            elCell.classList.add('safe-cell');
            setTimeout(() => {
                elCell.classList.remove('safe-cell')
            }, 2000);
        }
    } else return;
}

function setSafeClickBtn() {
    var elSafeBtn = document.querySelector('.safe-count');
    elSafeBtn.innerText = gSafeCount;
}

function changeSmileyFace(value) {
    var elSmileyBtn = document.querySelector('.smiley button')
    elSmileyBtn.innerText = value;
}