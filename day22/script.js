function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}


window.ctx = null;
window.record_frames = 0;
window.recording = [];
async function main(canvas) {
    canvas.height = 1000;
    canvas.width = 1000;
    ctx = canvas.getContext("2d");

    const clear = () => {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(0, 0, 1000, 1000);
        ctx.fill();
    }

    const draw = (t) => {
        clear();
        const to_cartesian = (x) => {
            const r = x;
            const theta = 3 * x + t / 1000;
            const coords = [Math.cos(theta), Math.sin(theta)].map(e => e * r);
            coords[0] += ctx.canvas.width / 2;
            coords[1] += ctx.canvas.height / 2;

            return coords;
        };

        ctx.strokeStyle = "white";
        const step = 0.1;
        for (let i = 0; i < 500; i += step) {
            ctx.beginPath();
            ctx.moveTo(...to_cartesian(i - step));
            ctx.lineTo(...to_cartesian(i));
            ctx.stroke();
        }

        if (window.record_frames) {
            window.record_frames--;
            window.recording.push(ctx.canvas.toDataURL());
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}
