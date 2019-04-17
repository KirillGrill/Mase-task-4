
    const SETTINGS = {
        rows: 10,
        cols: 10,
        cellState: {
            free: 0,
            wall: 1,
            start: 2,
            finish: 3,
            visited: 4
        },
        cellClass: ['cell', 'wall', 'start', 'finish'],
        fieldNumber: 0
    };

    let startCell = [];
    let $cellElements = [];

    let matrix = [[
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,1,0,1,1,1,0],
        [0,2,1,0,1,0,1,0,0,0],
        [1,1,1,0,1,0,1,0,1,0],
        [0,0,0,0,1,0,0,0,1,0],
        [1,1,1,1,1,1,0,0,1,1],
        [0,0,1,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,3,0,0,1,0,0,1,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ], [
        [0,0,0,1,0,0,0,1,0,0],
        [0,0,1,1,3,0,0,0,0,1],
        [0,1,1,0,0,1,1,0,1,1],
        [0,0,0,0,0,1,0,0,1,0],
        [0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,0,1,0,0],
        [0,0,0,1,1,1,0,1,0,0],
        [1,1,1,1,0,1,1,1,0,0],
        [2,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ],[
        [0,0,0,1,0,0,0,1,0,2],
        [0,0,0,1,0,0,0,0,0,1],
        [0,1,1,1,0,1,1,0,1,1],
        [0,0,0,0,0,1,0,0,1,0],
        [0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,1,0,0,0,0],
        [1,1,1,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0,0]
    ]];

    window.addEventListener('load', init);

    function init() {
        const newField = document.getElementById('newField');
        const findWayToExit = document.getElementById('findWayToExit');

        newField.addEventListener('click', drowNewField);
        findWayToExit.addEventListener('click', drowWayToExit);

        let matrixCopy = matrix[SETTINGS.fieldNumber].slice();
        buildMaze(matrixCopy);

        for(let i = 0; i < 10; ++i){//------------------определяем координаты старта
            for(let j = 0; j < 10; ++j){
                if(matrixCopy[i][j] === 2)
                    startCell = [j,i];
            }
        }
    }

    function drowNewField() {
        let $container = document.getElementById('maze');
        $container.innerHTML = '';

        let matrixCopy = matrix[(++SETTINGS.fieldNumber % 3)].slice();
        buildMaze(matrixCopy);
        console.log(SETTINGS.fieldNumber % 3);
    }

    function drowWayToExit() {

        /*
            Тут отчасти мой косяк - недосказанность.
            Я вам сказал и показал, что слайс делает копию массива
            и это правда. Вот только нужно учитывать, что у тебя массив
            двумерный и каждый элемент массива тоже массив

            получается как то так

            [[c]].slice() => [[c]] массив с элементом с переезжает в новый массив
            но сам по себе он всё еще является ссылкой на один и тот же массив

            Выходит что после обработки одной из матриц ты "портишь" её значения навсегда,
            нужно сделать deep copy, скопировать не только 1ый, но и 2й уровни массива

            Можно например так:

            array.map(innerArray => innerArray.slice());

            ES5
            array.map(function(innerArray) {
                return innerArray.slice();
            });
        */
        let matrixCopy = matrix[(SETTINGS.fieldNumber % 3)].slice();
        for(let i = 0; i < 10; ++i){
            for(let j = 0; j < 10; ++j){
                if(matrixCopy[i][j] === 2)
                    startCell = [j,i];
            }
        }

        bildWayToStart (findExit(matrixCopy), matrixCopy);
    }


    function buildMaze(matrix) {

        let $container = document.getElementById('maze');

        /*
            так как ты вызываешь этот метод для разных наборов данных,
            неплохо было бы тут почистить/обнулить свой глобальный массив
            
            $cellElements

        */

        for(let i = 0; i < SETTINGS.rows; i++) {
            for(let j = 0; j < SETTINGS.cols; j++) {
                let cell = matrix[i][j];
                let $cellEl = document.createElement('div');

                $cellEl.classList.add(SETTINGS.cellClass[0], SETTINGS.cellClass[cell]);
                $container.appendChild($cellEl);
                $cellElements.push($cellEl);
            }
        }
    }

    function findExit(matrix) {

        let move = 1;
        let nextCells = [startCell];
        let mode = 'find finish';
        while(!isPoint(matrix, nextCells, SETTINGS.cellState.finish)) {
            nextCells = nextCells.map((cell) => {

                return moveToNeighbours(cell, matrix, move, mode);
            }).flat();

            move++;
        }
        return isPoint(matrix, nextCells, SETTINGS.cellState.finish);//координаты финиша
    }

    function bildWayToStart(finish, matrix) {

        let move = 9999;
        let nextCells = [finish];
        let mode = 'find start';

        while(!isPoint(matrix, nextCells, SETTINGS.cellState.start)) {
            nextCells = nextCells.map((cell) => {

                return moveToNeighbours(cell, matrix, move, mode);
            }).flat();
            let x = nextCells[0][0];//т.к при отрисовке маршрута от финиша к старту возможный путь будет только один. в nextCells всегда будет только нулевой элемент
            let y = nextCells[0][1];//
            move = +$cellElements[y * SETTINGS.rows + x].innerHTML;
        }
    }

    function isPoint(matrix, nextCells, point) {//используется для поиска нужной точки(старта или финиша)
        for(let i = 0; i < nextCells.length; ++i){
            let x = nextCells[i][0];
            let y = nextCells[i][1];
            let isPoint = matrix[y] && matrix[y][x];
            if(isPoint === point){
                return nextCells[i];
            }
        }
    }

    function moveToNeighbours(cell, matrix, move, mode) {

        let cells = [
            moveUp(cell[0], cell[1], matrix, move, mode),
            moveDown(cell[0], cell[1], matrix, move, mode),
            moveLeft(cell[0], cell[1], matrix, move, mode),
            moveRight(cell[0], cell[1], matrix, move, mode)
        ];

        return cells.filter(cell => cell !== null);
    }

    function moveUp(x, y, matrix, move, mode) {
        return moveTo(x, y - 1, matrix, move, mode);
    }

    function moveDown(x, y, matrix, move, mode) {
        return moveTo(x, y + 1, matrix, move, mode);
    }

    function moveLeft(x, y, matrix, move, mode) {
        return moveTo(x - 1, y, matrix, move, mode);
    }

    function moveRight(x, y, matrix, move, mode) {
        return moveTo(x + 1, y, matrix, move, mode);
    }

    function moveTo(x, y, matrix, move, mode) {
        let cell = matrix[y] && matrix[y][x];

        if(mode === 'find finish'){
           if (cell === SETTINGS.cellState.finish) {
                return [x, y];
            }

            if (cell === SETTINGS.cellState.free) {
                $cellElements[y * SETTINGS.rows + x].innerHTML = move;
                matrix[y][x] = SETTINGS.cellState.visited;
                return [x, y];
            }

            return null;
        }

        if(mode === 'find start'){
            if (cell === SETTINGS.cellState.start) {
                return [x, y];
            }

            if (cell === SETTINGS.cellState.visited ) {
               if(+$cellElements[y * SETTINGS.rows + x].innerHTML < move){
                    $cellElements[y * SETTINGS.rows + x].classList.add('route');
                    matrix[y][x] = SETTINGS.cellState.free;

                       for(let i = 0; i < 10; ++i){//что бы не было двух маршрутов, когда к финишной ячейке касаются две ячейки с одинаковыми номерами хода
                           for(let j = 0; j < 10; ++j){
                               if(+$cellElements[j * SETTINGS.rows + i].innerHTML === +$cellElements[y * SETTINGS.rows + x].innerHTML){
                                   matrix[j][i] = SETTINGS.cellState.free;
                               }
                           }
                       }

                   return [x, y];
               }
            }
            return null;
        }
    }


