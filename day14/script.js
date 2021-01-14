var draw_promise = null;
var ctx = null;
var cancel = false;

let butterflys = null;
let bcolors = [];
let flapping = [];
let curr_counts = [];

window.record_frames = 0;
window.recording = [];

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function draw(resolver) {
    const dimensions = [ctx.canvas.width, ctx.canvas.height];
    ctx.clearRect(0, 0, ...dimensions);
    if (!butterflys) {
        butterflys = [];
        function subdivide(origin, dimensions) {
            const size = dimensions.map(x => x /2);
            for (let i = 0; i < 4; i++) {
                const ix = i % 2;
                const iy = Math.floor(i / 2);
                const pos = [origin[0] + size[0] * ix, origin[1] + size[1] * iy];

                // if (Math.random() < 0.5) {
                if (size[0] > 10 && Math.random() < 0.5) {//ix != iy) {
                    subdivide([...pos], [...size])
                } else {
                    colors[0] = getRandomColor();
                    colors[1] = getRandomColor();
                    colors[2] = getRandomColor();

                    const butterfly = new RGButterfly(dimensions, size.map(x => x * 0.9));

                    const ix = i % 2;
                    const iy = Math.floor(i / 2);

                    butterfly.position = [pos[0] + size[0] / 2, pos[1]];
                    butterfly.speed = 12;// * (1 - size[0] / 1000);
                    butterflys.push(butterfly);
                    bcolors.push(getRandomColor());
                    flapping.push(false);
                    curr_counts.push(0);
                }
            }
        }

        subdivide([0, 0], dimensions);
    }

    butterflys.forEach((butterfly, i) => {
        ctx.fillStyle=bcolors[i];
        ctx.beginPath();
        let position = [...butterfly.position];
        let size = [...butterfly.size];
        position[0] -= butterfly.size[0] / 2;
        ctx.rect(...position, ...size);
        ctx.fill();

        butterfly.draw(ctx, true, !flapping[i]);
        if (flapping[i]) {
            if (butterfly.flap_count != curr_counts[i])
                flapping[i] = false;
        } else if (Math.random() < 0.01) {
            curr_counts[i] = butterfly.flap_count;
            flapping[i] = true;
        }
    });

    if (window.record_frames) {
        recording.push(ctx.canvas.toDataURL());
        window.record_frames--;
    }

    if (cancel) {
        resolver();
    } else
        requestAnimationFrame(() => draw(resolver));
}

async function day14_main(target) {
    if (!ctx) {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.width = "100%";
        ctx = canvas.getContext("2d");
        target.appendChild(canvas);
    }

    if (draw_promise) {
        cancel = true;
        await draw_promise;

        draw_promise = null;
        flapping = [];
        curr_counts = [];
        butterflys = null;
        bcolors = [];

        cancel = false;
    }

    draw_promise = new Promise(r => draw(r));
}
