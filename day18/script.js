function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

class Line {
    start_pt = [0, 0];
    end_pt = [1, 0];
    cp = [0, 0];
    color = "";
    constructor(start_pt, end_pt, cp) {
        this.start_pt = start_pt;
        this.end_pt = end_pt;
        this.cp = this.cp;
        this.color = getRandomColor();
    }
}

function to_cartesian(pt, count) {
    const theta = pt[0] * 2 * Math.PI / count;
    const r = pt[1];
    const c = [Math.cos(theta), Math.sin(theta)].map(x => r * x);
    return [c[0] + 500, c[1] + 500];
}

class Web {
    lines = [];
    highest_pt = [];
    count = 0;

    constructor(canvas, count) {
        this.count = count;
        for (let i = 0; i < count; i++)
            this.highest_pt.push(0);
        canvas.height = 1000;
        canvas.width = 1000;
        this.ctx = canvas.getContext("2d");
    }

    draw() {
        this.ctx.clearRect(0, 0, 1000, 1000);

        // if (Math.random() < 0.25) {
            let start = [0, 1];
            if (this.lines.length != 0)
                start = [...this.lines[this.lines.length - 1].end_pt];

            const end = [(start[0] + 1) % this.count, start[1] + Math.random() * 10];

            const cp = end.map((x, i) => (x + start[i]) / 2);
            cp[1] -= Math.random() * 0.1;

            this.lines.push(new Line(start, end, cp));
        //}

        for (let line of this.lines) {
            const startpt = to_cartesian(line.start_pt, this.count);
            const endpt = to_cartesian(line.end_pt, this.count);
            const cppt = to_cartesian(line.cp, this.count);
            this.ctx.strokeStyle = line.color;
            this.ctx.beginPath();
            this.ctx.moveTo(...startpt);
            this.ctx.quadraticCurveTo(...cppt, ...endpt);
            this.ctx.stroke();
        }

        if (Math.random() < (0.25 + this.lines.length / 100)) {
            const removeidx = Math.floor(Math.random() * this.lines.length);
            const removed = this.lines.splice(removeidx, 1);
            let diff = -1;
            for (let line of this.lines) {
                if (line.start_pt[0] != removed[0].end_pt[0])
                    continue;

                if (line.start_pt[1] < removed[0].end_pt[1])
                    continue;

                if (diff == -1)
                    diff = line.start_pt[1] - removed[0].end_pt[1];
                line.start_pt[1] -= diff;
            }

            diff = -1;
            for (let line of this.lines) {
                if (line.end_pt[0] != removed[0].end_pt[0])
                    continue;

                if (line.end_pt[1] < removed[0].end_pt[1])
                    continue;

                if (diff == -1)
                    diff = line.end_pt[1] - removed[0].end_pt[1];
                line.end_pt[1] -= diff;
            }
        }
    }
}

window.recording = [];
window.record_frames = 200;
function main(canvas) {
    const web = new Web(canvas, 8);
    const draw = () => {
        web.draw();
        if (window.record_frames) {
            window.record_frames--;
            window.recording.push(web.ctx.canvas.toDataURL());
        }
        setTimeout(() => { requestAnimationFrame(draw); }, 100);
    };
    requestAnimationFrame(draw);
}
