let _images = 0;
async function getRandomImage(img_target, keep_img) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://picsum.photos/1000?i=${_images++}`
    img.style.display = 'none';
    img.style.width = '50%';
    img_target.appendChild(img);
    await (new Promise(r => img.onload = r));

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style.width = "100%";
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    if (!keep_img)
        img.remove();
    else
        img.style.display = "";
    console.log("DOWNLOADED");
    return ctx;
}

const block_size = 10;
const block_size_2 = block_size * block_size;

window.datas = [];
function generateDatas() {
    if (datas.length != 100) {
        for (let i = 0; i < 100; i++)
            getRandomImage(document.body).then(ictx => {
                const data = ictx.getImageData(0, 0, 1000, 1000);
                const avg_color = [0, 0, 0];
                for (let y = 0; y < 1000; y++) {
                    for (let x = 0; x < 1000; x++) {
                        const base_idx = 4 * (y * 1000 + x);
                        avg_color[0] += data.data[base_idx] / (1000 * 1000);
                        avg_color[1] += data.data[base_idx + 1] / (1000 * 1000);
                        avg_color[2] += data.data[base_idx + 2] / (1000 * 1000);
                    }
                }
                datas.push({
                    img: ictx.canvas,
                    color: avg_color
                })
            });
    }
}

async function generateFinal(target) {
    const final_image = await getRandomImage(target, true);

    window.final_colors = [];
    window.final_data = final_image.getImageData(0, 0, 1000, 1000);
    for (let y = 0; y < 1000 / block_size; y++) {
        for (let x = 0; x < 1000 / block_size; x++) {
            const start_y = y * block_size;
            const start_x = x * block_size;
            const avg_color = [0, 0, 0];
            for (let i_y = 0; i_y < block_size; i_y++) {
                for (let i_x = 0; i_x < block_size; i_x++) {
                    const idx = 4 * ((start_y + i_y) * 1000 + (start_x + i_x));
                    avg_color[0] += final_data.data[idx] / block_size_2;
                    avg_color[1] += final_data.data[idx + 1] / block_size_2;
                    avg_color[2] += final_data.data[idx + 2] / block_size_2;
                }
            }

            final_colors.push(avg_color);
        }
    }
}

var cancel = false;
var draw_promise = null;
var ctx = null;
function draw(resolver) {
    if (datas.length) {
        for (let idx_y = 0; idx_y < (1000 / block_size); idx_y++) {
            for (let idx_x = 0; idx_x < (1000 / block_size); idx_x++) {
                const idx = idx_y * (1000 / block_size) + idx_x;

                const target_color = final_colors[idx];
                let best = Infinity;
                let best_data = null;
                let best_i = 0;
                for (let i = 0; i < datas.length; i++) {
                    const color = datas[i].color;
                    const dist = target_color.map(
                        (x, i) => Math.abs(x - color[i])).reduce((x, y) => x + y);
                    if (best > dist) {
                        best = dist;
                        best_data = datas[i];
                        best_i = i;
                    }
                }

                ctx.drawImage(
                    best_data.img,
                    idx_x * block_size, idx_y * block_size,
                    block_size, block_size,
                );
            }
        }
    }

    if (cancel)
        resolver();
    else
        setTimeout(() => { requestAnimationFrame(() => draw(resolver)) }, 100);
}

async function main(target) {
    if (!ctx) {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.width = "50%";
        ctx = canvas.getContext("2d");
        target.appendChild(canvas);
    }

    if (draw_promise) {
        console.log("canceling");
        cancel = true;
        await draw_promise;
        draw_promise = null;
        cancel = false;
    }

    target.querySelectorAll("img").forEach(x => x.remove());


    await generateFinal(target);
    if (datas.length == 0) {
        console.log("Fetching new datas");
        generateDatas();
    }
    draw_promise = new Promise(r => draw(r));
}
