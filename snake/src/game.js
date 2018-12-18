import './style.css';
import { Snake, Seed } from './snake.js';

class Panel {
    constructor() {
        this.dom = document.body.appendChild(document.createElement('div'));
        this.dom.className = 'panel panel-hidden';
    }

    showStart() {
        this.dom.innerHTML = '<h3>准备</h3><br><p>空格开始！</p>';
        this.dom.classList.remove('panel-hidden');
    }

    showEnd() {
        this.dom.innerHTML = `<h3>${score.getScore()}分!</h3><br><p>空格再来一局！</p>`;
        this.dom.classList.remove('panel-hidden');
    }

    hide() {
        this.dom.classList.add('panel-hidden');
    }
}

class Score {
    constructor() {
        this.count = 0;
        this.dom = document.body.appendChild(document.createElement('h1'));
        this.dom.className = 'score';
    }

    add() {
        this.count++;
        this.dom.textContent = '分数：' + this.count;
    }

    reset() {
        this.count = 0;
        this.dom.textContent = '分数：' + this.count;
    }

    getScore() {
        return this.count;
    }
}

const score = new Score();
const panel = new Panel();

var snake = new Snake({
    onfail: () => panel.showEnd(),
    oneat: () => score.add(),
    seed: new Seed(),
});

document.onkeydown = e => {
    if (e.keyCode === 32) {
        if (!snake.isRunning()) {
            snake.run();
            panel.hide();
            score.reset();
        }
    }
}

panel.showStart();