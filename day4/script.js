const colors = ["#ff0000", "#00ff00", "#0000ff"];
function get_random_color() {
    return colors[Math.floor(Math.random() * 3)];
}

function draw_butterfly(dimensions) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = dimensions[0];
    canvas.height = dimensions[1];

    let start = [0, 0];
    let limits = dimensions.map(x => x / 2);
    let flip = false;
    let shape_limit = 20;
    function draw_wing() {
        let num_shapes = Math.random() * shape_limit + shape_limit;
        for (let i = 0; i < num_shapes; i++) {
            let point = [0, 0];
            while (true) {
                point = limits.map(x => Math.random() * x);
                if (!flip) {
                    if (point[0] < (limits[0] / 2) && point[1] < (limits[1] / 2))
                        continue;
                    if (point[0] > (limits[0] / 2) && point[1] > (limits[1] / 2))
                        continue;
                } else {
                    if (point[0] > (limits[0] / 2) && point[1] < (limits[1] / 2))
                        continue;
                    if (point[0] < (limits[0] / 2) && point[1] > (limits[1] / 2))
                        continue;
                }
                break;
            }
            point = point.map((x, i) => x + start[i]);

            const wing_dims = limits.map(x => Math.random() * (x / 2));

            ctx.beginPath();
            ctx.strokeStyle = get_random_color();
            ctx.rect(...point, ...wing_dims);
            ctx.stroke();
        }
    }

    draw_wing();

    start = [0, dimensions[1] / 2];
    limits = dimensions.map(x => x / 4);
    flip = true;
    shape_limit = 10;
    draw_wing();
    return canvas;
}

class RGButterfly {
    flap_count = 0;

    constructor(dimensions, size) {
        size = size || [50, 50];
        this.wings = draw_butterfly(size);
        this.src_params = [0, 0, this.wings.width, this.wings.height];
        this.position = [Math.random() * dimensions[0], dimensions[1]];
        this.speed = 4 + Math.random() * 8;

        this.wfactor = 1;
        this.decreasing = true;
        this.size = size;
    }

    draw(ctx, stationary, noflap) {
        ctx.drawImage(
            this.wings,
            ...this.src_params,
            ...this.position,
            this.wings.width / this.wfactor,
            this.wings.height,
        );
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            this.wings,
            ...this.src_params,
            -1 * this.position[0],
            this.position[1],
            this.wings.width / this.wfactor,
            this.wings.height
        );
        ctx.restore();

        if (!stationary)
            this.position[1] -= this.speed;

        if (!noflap) {
            if (this.decreasing) {
                if (this.wfactor < 2)
                    this.wfactor += 0.01 * this.speed;
                else
                    this.decreasing = false;
            } else {
                if (this.wfactor > 1)
                    this.wfactor -= 0.01 * this.speed;
                else {
                    this.decreasing = true;
                    this.flap_count += 1;
                }
            }
        }
    }
}

function main(canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 1000;

    const butterflys = [];
    const butterfly_limit = 50;
    for (let i = 0; i < butterfly_limit; i++)
        butterflys.push(new RGButterfly([canvas.width, canvas.height]));

    const f = () => {
        ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.height);
        for (let i = 0; i < butterflys.length; i++) {
            butterflys[i].draw(ctx);
            if (butterflys[i].position[1] < 0)
                butterflys[i] = new RGButterfly([canvas.width, canvas.height]);
        }

        requestAnimationFrame(f);
    }
    f();
}
