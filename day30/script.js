const TAU = 2 * Math.PI;
class BoidButterfly {
    constructor(canvas) {
        const dimensions = [canvas.width, canvas.height];
        this.butterfly = new RGButterfly(dimensions);
        this.butterfly.position = [0, 0];
        this.position = [0, 0];//dimensions.map(x => x * Math.random());
        for (let i = 0; i < 2; i++) {
            if (Math.random() < 0.5) {
                this.position[i] = 0 - Math.random() * 10;
            } else {
                this.position[i] = 1000 + Math.random() * 10;
            }
        }
        this.angle = Math.random() * TAU;
        this.speed = this.butterfly.speed;
        this.butterfly.speed *= 0.5;
    }

    advance() {
        return [
            this.position[0] -this.speed * Math.cos(this.angle),
            this.position[1] -this.speed * Math.sin(this.angle)
        ]
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(...this.position);
        ctx.rotate(this.angle - Math.PI / 2);
        this.butterfly.draw(ctx, true);
        ctx.restore();

        // this.position[0] -= this.speed * Math.cos(this.angle);
        // this.position[1] -= this.speed * Math.sin(this.angle);
        // if (Math.random() < 0.25) {
        //     this.angle += 0.01 * this.speed;
        //     if (this.angle > TAU)
        //         this.angle -= TAU;
        // }
    }
}

function dist(a, b) {
    return Math.sqrt(a.map((x, i) => x - b[i]).map(x => x * x).reduce((x, y) => x + y));
}

const athresh = 50;
const w_a = 2;

const cthresh = 100;
const w_c = 3;

const sthresh = 20;
const w_s = 3;

function day30_main(canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 1000;

    const butterflys = [];
    const butterfly_limit = 100;
    const gen = () => {
        if (butterflys.length < butterfly_limit) {
            butterflys.push(new BoidButterfly(canvas));
            setTimeout(gen, 100);
        }
    };
    gen();

    const outOfBounds = (pos) => {
        const thresh = 0;
        return (
            pos[0] < thresh ||
            pos[1] < thresh ||
            pos[0] > (1000 - thresh) ||
            pos[1] > (1000 - thresh)
        );
    };

    const f = () => {
        ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.height);
        for (let i = 0; i < butterflys.length; i++) {
            let acount = 0;
            let alignment = 0;

            let ccount = 0;
            let cohesion = 0;

            let scount = 0;
            let seperation = 0;

            let center = [0, 0];
            let sep = [0, 0];
            for (let j = 0; j < butterflys.length; j++) {
                if (i == j)
                    continue;

                const d = dist(butterflys[i].position, butterflys[j].position);

                if (d < athresh) {
                    acount++;
                    alignment += butterflys[j].angle;
                }

                if (d < cthresh) {
                    ccount++;
                    center[0] += butterflys[j].position[0];
                    center[1] += butterflys[j].position[1];
                }

                if (d < sthresh) {
                    scount++;
                    let dir = butterflys[j].position.map((x, e) => x - butterflys[i].position[e]);
                    sep[0] += dir[0];
                    sep[1] += dir[1];
                }
            }

            if (acount) {
                alignment /= acount;
            }

            if (ccount) {
                center = center.map(x => x / ccount);
                let dir = center.map((x, e) => x - butterflys[i].position[e]);
                cohesion = Math.atan2(dir[1], dir[0]) + Math.PI;
            }

            if (scount) {
                sep = sep.map(x => x / scount);
                seperation = Math.atan2(sep[1], sep[0]);
            }

            let update =
                (w_a * alignment + w_c * cohesion + w_s * seperation) / (w_a + w_c + w_s);
            while (update > TAU)
                update -= TAU;
            while (update < 0)
                update += TAU;

            if (isNaN(update)) {
                console.log(i, update, ncount);
                throw new Error("!");
            }
            butterflys[i].angle += (update - butterflys[i].angle) / 10;

            let newpos = butterflys[i].advance();
            // while (outOfBounds(newpos)) {
            //     butterflys[i].angle += 0.1 + (Math.random() - 0.5);
            //     newpos = butterflys[i].advance();
            // }

            butterflys[i].position = newpos;
            butterflys[i].draw(ctx);

            if (outOfBounds(newpos))
                butterflys[i] = new BoidButterfly(canvas);
        }
            //{
            // }

        requestAnimationFrame(f);
    }
    f();

    window.f= f;
}
