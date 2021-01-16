const TAU = 2 * Math.PI;

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

class Circle {
    subcircle = null;
    sc_r = 0;
    sc_theta = 0;
    sc_speed = 0;
    sc_rev = false;

    color = "rgb(0, 0, 0)";
    radius = 0;

    constructor(radius) {
        this.radius = radius;
        this.color = getRandomColor();

        if (this.radius > 100) {
            this.sc_r = Math.random() * this.radius / 4 + this.radius / 8;
            this.sc_theta = Math.random() * TAU;
            this.sc_speed = Math.random() * 0.05;
            this.sc_rev = Math.random() > 0.5;

            const sub_radius = this.radius - this.sc_r;
            this.subcircle = new Circle(sub_radius);

        }
        // TODO generate subcircle
    }

    draw(ctx, center, draw_all, trace) {
        if (draw_all) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.arc(...center, this.radius, 0, TAU)
            ctx.stroke();
        }

        // if (!this.subcircle) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.arc(...center, 2, 0, TAU)
            ctx.stroke();
        //}

        if (this.subcircle) {
            const subcenter = [Math.cos(this.sc_theta), Math.sin(this.sc_theta)].map(
                (x, i) => this.sc_r * x + center[i]
            );
            this.subcircle.draw(ctx, subcenter, draw_all, trace);
        }
    }

    update() {
        this.sc_theta += (this.sc_rev ? -1 : 1) * this.sc_speed;
        this.sc_theta = (this.sc_theta + TAU) % TAU;
        if (this.subcircle)
            this.subcircle.update();
    }
}

function main(target) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style.width = "100%";
    const ctx = canvas.getContext("2d");
    const c = new Circle(300);

    let trace = true;
    const f = () => {
        if (!trace)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        c.draw(ctx, [500, 500], !trace, trace);
        c.update();

        requestAnimationFrame(f);
    };
    requestAnimationFrame(f);

    target.appendChild(canvas);

    const toggle = document.createElement('button');
    toggle.innerText = "Toggle drawing mode";
    toggle.onclick = () => {
        trace = !trace;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    target.appendChild(toggle);
}
