let _images = 0;
async function getRandomImage() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://picsum.photos/1000?i=${_images++}`
    img.style.display = 'none';
    // img.style.width = '24%';
    document.body.appendChild(img);
    await (new Promise(r => img.onload = r));

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style.width = "100%";
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    img.remove();
    console.log("DOWNLOADED");
    return ctx.getImageData(0, 0, 1000, 1000);
}

window.record_frames = 2000;
window.recording = [];

async function main(target) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    //canvas.style.width = "100%";
    canvas.style.width = "50%";
    const ctx = canvas.getContext("2d");

    target.appendChild(canvas);

    const datas = [];
    for (let i = 0; i < 10; i++)
        getRandomImage().then(data => datas.push(data))


    let current = 0;
    let counter = 0;

    function draw() {
        if (datas.length) {
            if (counter == 1000) {
                current = Math.floor(Math.random() * datas.length);
                counter = 0;
            }

            let prob = 0.25;
            prob -= 0.01 * 25 * counter / 1000;
            const idx = Math.random() > prob ? current : Math.floor(Math.random() * datas.length);

            const data = datas[idx];
            const x = Math.floor(Math.random() * 900);
            const y = Math.floor(Math.random() * 900);
            ctx.putImageData(data, 0, 0, x, y, 100, 100);

            counter++;
        }

        if (window.record_frames) {
            window.recording.push(canvas.toDataURL());
            window.record_frames--;
        }

        requestAnimationFrame(draw);
    }

    draw();
}
