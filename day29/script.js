function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

class Shape {
    color = ""
    center = [0, 0]
    r = 0
    sides = 0

    constructor(sides, r, center) {
        this.color = getRandomColor();
        this.sides = sides;
        this.r = r;
        this.center = center;
    }

    draw(ctx) {
        let angles = [];
        for (let i = 0; i < this.sides; i++) {
            angles.push(Math.random() * 2 * Math.PI);
        }
        angles.sort((x, y) => x - y);

        const movetoangle = (angle) => {
            const pos = [Math.cos(angle), Math.sin(angle)].map(e => this.r * e);
            pos[0] += this.center[0];
            pos[1] += this.center[1];
            return pos;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(...movetoangle(angles[0]));
        for (let angle of angles)
            ctx.lineTo(...movetoangle(angle));
        ctx.fill();
    }
}

function dist(posa, posb) {
    return Math.sqrt(posa.map((x, i) => x - posb[i]).map(x => x ** 2).reduce((x, y) => x + y));
}

let shapes = [];
function generate() {
    shapes = [];
    for (let i = 0; i < 100; i++) {
        while (true) {
            let center = [1000, 1000].map(x => x * Math.random());
            let r = 500;
            let needs_new_center = false;
            for (let shape of shapes) {
                let d = dist(center, shape.center);
                if (d <= shape.r) {
                    needs_new_center = true;
                    break;
                }

                r = Math.min(r, d - shape.r);
            }

            if (needs_new_center)
                continue;

            shapes.push(new Shape(Math.floor(Math.random() * 17) + 3, r, center));
            break;
        }
    }
}

function main(canvas) {
    canvas.height = 1000;
    canvas.width = 1000;
    ctx = canvas.getContext("2d");

    const clear = () => {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(0, 0, 1000, 1000);
        ctx.fill();
    };

    generate();

    const f= async () => {
        clear();
        for (let shape of shapes)
            shape.draw(ctx);
        await new Promise(r => setTimeout(r, 100));
        requestAnimationFrame(f);
    };
    f();
}
