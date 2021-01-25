function getRandomColor(x) {
    const colors = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];
    return colors[Math.floor(x) % colors.length];
}

const draw = async (x) => {
    if (window.record_frames) {
        window.record_frames--;
        window.recording.push(web.ctx.canvas.toDataURL());
    }

    let angles = [];
    for (let i = 0; i < x; i++) {
        angles.push(Math.random() * 2 * Math.PI);
    }
    // angles.sort((x, y) => x - y);

    const center = [
        Math.random() * 1000,
        Math.random() * 1000
    ];

    const movetoangle = (angle) => {
        const pos = [Math.cos(angle), Math.sin(angle)].map(e => x * e);
        pos[0] += center[0];
        pos[1] += center[1];
        return pos;
    }

    ctx.fillStyle = getRandomColor(x);
    ctx.beginPath();
    ctx.moveTo(...movetoangle(angles[0]));
    for (let angle of angles) {
        const pos = [Math.cos(angle), Math.sin(angle)].map(e => x * e);
        pos[0] += center[0];
        pos[1] += center[1];
        ctx.lineTo(...pos);
    }
    ctx.fill();

    await new Promise(r => setTimeout(r, 100));
};

async function f(x) {
    if (x < 10)
        return;
    await draw(x);
    f(1 * x / 4);
    f(2 * x / 4);
    f(3 * x / 4);
}

function main(canvas) {
    graph = {};
    points = [];

    canvas.height = 1000;
    canvas.width = 1000;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.rect(0, 0, 1000, 1000);
    ctx.fill();

    f(1000);
}
