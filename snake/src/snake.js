const DISTANCE_STEP = 6;// 每帧走的像素值
const INIT_LENGTH = 4;// 初始长度对于宽度的倍数
const WIDTH_SNAKE = 40;// 蛇粗的像素值
const WIDTH_SEED = WIDTH_SNAKE / 2;//种子直径

const body = document.body;
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const recycledBodys = [];

class Snake {
    constructor({
        onfail,
        oneat,
        seed
    } = {}) {
        this.onfail = onfail;
        this.oneat = oneat;
        this.seed = seed || new Seed();

        this.reset();
        this.render();
        document.addEventListener('keydown', e => {
            if (this.running) {
                switch (e.keyCode) {
                    case 37: // ←
                        this.nextDirection = -1;
                        break;
                    case 38: // ↑
                        this.nextDirection = 2;
                        break;
                    case 39: // →
                        this.nextDirection = 1;
                        break;
                    case 40: // ↓
                        this.nextDirection = -2;
                        break;
                }
            }
        })
    }

    step() {
        const parts = this.parts;
        let head = parts[0];
        const headDirection = head.direction;
        const nextDirection = this.nextDirection;
        if (nextDirection !== headDirection && nextDirection !== -headDirection && (head.width === WIDTH_SNAKE && head.height > WIDTH_SNAKE * 2 || head.height === WIDTH_SNAKE && head.width > WIDTH_SNAKE * 2)) {
            const bodyArgs = {
                direction: nextDirection,
                width: WIDTH_SNAKE,
                height: WIDTH_SNAKE
            }
            switch (headDirection) {
                case 2:
                    bodyArgs.top = head.top;
                    bodyArgs.left = head.left;
                    break;
                case 1:
                    bodyArgs.left = head.left + head.width - WIDTH_SNAKE;
                    bodyArgs.top = head.top;
                    break;
                case -2:
                    bodyArgs.top = head.top + head.height - WIDTH_SNAKE;
                    bodyArgs.left = head.left;
                    break;
                case -1:
                    bodyArgs.left = head.left;
                    bodyArgs.top = head.top;
                    break;
            }
            head = recycledBodys.shift();
            head ? head.reset(bodyArgs) : (head = new SnakeBodyPart(bodyArgs));
            this.parts.unshift(head);
            head.forward();
        } else {
            head.forward();
        }

        const tail = parts[parts.length - 1];
        tail.shrink();

        this.render();

        if (tail.isDead()) {
            recycledBodys.push(parts.pop());
        }

        if (this.doCheck() === false) {
            this.fail();
        }
    }

    doCheck() {
        const parts = this.parts;
        const head = parts[0];
        const { left, top, width, height, direction } = head;
        if (left < 0 || top < 0 || left + width > windowWidth || top + height > windowHeight) {
            return false;
        }

        for (let i = 3; i < parts.length; i++) {
            let p = parts[i];
            if (!(left > p.left + p.width || left + width < p.left) && !(top > p.top + p.height || top + height < p.top)) {
                return false;
            }
        }

        const x = direction === 1 ? left + width - WIDTH_SNAKE / 2 : left + WIDTH_SNAKE / 2;
        const y = direction === -2 ? top + height - WIDTH_SNAKE / 2 : top + WIDTH_SNAKE / 2
        const { x: x2, y: y2 } = this.seed.getCoordinate();
        const gap_x = x - x2, gap_y = y - y2;
        if (gap_x * gap_x + gap_y * gap_y < WIDTH_SEED * WIDTH_SEED) {
            this.seed.toggleLocation();
            this.grow();
            this.oneat && this.oneat();
        }
    }

    grow() {
        this.parts[this.parts.length - 1].grow();
    }

    render() {
        this.parts.forEach(part => part.render());
    }

    run() {
        if (!this.running) {
            this.reset();
            if (!this.seed.dom) {
                this.seed.toggleLocation();
            }
            const step = () => {
                this.step();
                if (this.running) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
            this.running = true;
        }
    }

    fail() {
        this.running = false;
        this.onfail && this.onfail();
    }

    isRunning() {
        return this.running;
    }

    reset() {
        this.running = false;
        this.parts && this.parts.forEach(p => {
            recycledBodys.push(p);
            p.recycle();
        });
        this.parts = [new SnakeBodyPart({
            left: 0,
            top: 0,
            width: INIT_LENGTH * WIDTH_SNAKE,
            height: WIDTH_SNAKE,
            direction: 1
        })]
        this.nextDirection = 1;
        this.render();
    }
}

class SnakeBodyPart {
    constructor(args) {
        this.reset(args);
    }

    forward() {
        switch (this.direction) {
            case 2:
                this.top -= DISTANCE_STEP;
                this.height += DISTANCE_STEP;
                break;
            case 1:
                this.width += DISTANCE_STEP;
                break;
            case -2:
                this.height += DISTANCE_STEP;
                break;
            case -1:
                this.width += DISTANCE_STEP;
                this.left -= DISTANCE_STEP;
                break;
        }
    }

    shrink() {
        switch (this.direction) {
            case 2:
                this.height -= DISTANCE_STEP;
                break;
            case 1:
                this.left += DISTANCE_STEP;
                this.width -= DISTANCE_STEP;
                break;
            case -2:
                this.top += DISTANCE_STEP;
                this.height -= DISTANCE_STEP;
                break;
            case -1:
                this.width -= DISTANCE_STEP;
                break;
        }
        if (Math.max(this.width, this.height) <= WIDTH_SNAKE) {
            this.dead = true;
        }
    }

    grow() {
        switch (this.direction) {
            case 2:
                this.height += WIDTH_SNAKE;
                break;
            case 1:
                this.left -= WIDTH_SNAKE;
                this.width += WIDTH_SNAKE;
                break;
            case -2:
                this.top -= WIDTH_SNAKE;
                this.height += WIDTH_SNAKE;
                break;
            case -1:
                this.width += WIDTH_SNAKE;
                break;
        }
    }

    isDead() {
        return this.dead;
    }

    reset({ left, top, direction, width, height }) {
        this.left = left;
        this.top = top;
        this.direction = direction;
        this.width = width;
        this.height = height;

        this.dead = false;
    }

    render() {
        if (!this.dom) {
            this.dom = body.appendChild(document.createElement('div'));
            this.dom.className = 'snake-part';
        } else if (this.needAppend) {
            body.appendChild(this.dom);
        }
        if (this.dead) {
            this.recycle();
        } else {
            this.dom.style.cssText = `width:${this.width}px;height:${this.height}px;top:${this.top}px;left:${this.left}px`;
        }
    }

    recycle() {
        body.removeChild(this.dom);
        this.needAppend = true;
    }
}

class Seed {

    toggleLocation() {
        const x = this.x = Math.floor(Math.random() * windowWidth);
        const y = this.y = Math.floor(Math.random() * windowHeight);
        const style = `width:${WIDTH_SEED}px;height:${WIDTH_SEED}px;left:${x}px;top:${y}px`;
        let dom = this.dom;
        if (dom) {
            dom.style.cssText = style;
        } else {
            dom = this.dom = document.createElement('div');
            dom.className = 'seed';
            dom.style.cssText = style;
            body.appendChild(dom);
        }
    }

    getCoordinate() {
        return {
            x: this.x,
            y: this.y
        }
    }
}

export {
    Snake, Seed
}