function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function to_cartesian(r, theta) {
    const c = [Math.cos(theta), Math.sin(theta)].map(x => r * x);
    return [c[0] + 500, c[1] + 500];
}

function main(canvas) {
    let r = 0;
    let curr = [Math.PI / 2];
    canvas.height = 1000;
    canvas.width = 1000;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.rect(0, 0, 1000, 1000);
    ctx.fill();

    const draw = async () => {
        let next_point = 0;
        if (window.record_frames) {
            window.record_frames--;
            window.recording.push(web.ctx.canvas.toDataURL());
        }

        let next = [];
        for (let theta of curr) {
            function get_theta() {
                const new_theta = theta + 2 * (Math.random() - 0.5) * r / 100;
                return new_theta;
                // return Math.min(Math.max(new_theta, Math.PI / 4), 5 * Math.PI / 4);
            }

            let children = [];

            children.push(get_theta());

            let count = 0;
            while (count < 2 && Math.random() > (1 - 1 / (r + 1))) {
                children.push(get_theta());
                count++;
            }

            for (let child of children) {
                const start = to_cartesian(10 * r, theta);
                const end = to_cartesian(10 * (r + 1), child);

                ctx.strokeStyle = getRandomColor();
                ctx.beginPath();
                ctx.moveTo(...start);
                ctx.lineTo(...end);
                ctx.stroke();
                next.push(child);

                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.arc(...start, 1, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.arc(...end, 1, 0, 2 * Math.PI);
                ctx.stroke();

                await new Promise(r => setTimeout(r, 0));
            }
        }
        curr = next;
        r++;

        if (r < 100)
            setTimeout(() => { requestAnimationFrame(draw); }, 10);
    };
    requestAnimationFrame(draw);
}
