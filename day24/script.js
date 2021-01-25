function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

class Clock {
    constructor(origin, r) {
        this.origin = origin;
        this.r = r;

        this.angle = 0;
        this.target_angle = 0;
        this.speed = Math.random() * 0.09 + 0.01;

        this.color = "black";//getRandomColor();
    }

    setAngle(angle) {
        this.angle = angle;
        while (this.angle < 0)
            this.angle += 2 * Math.PI;
        while (this.angle > 2 * Math.PI)
            this.angle -= 2 * Math.PI;
    }

    updateAngle() {
        if (this.angle == this.target_angle)
            return;

        const delta = Math.abs(this.angle - this.target_angle);
        if (delta < this.speed)
            this.angle = this.target_angle;

        if (this.angle > this.target_angle)
            this.angle -= this.speed;
        else
            this.angle += this.speed;
    }

    endCoords() {
        const coords = [Math.cos(this.angle), Math.sin(this.angle)].map(x => x * this.r);
        return coords.map((x, i) => x + this.origin[i]);
    }

    draw(ctx) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(...this.origin, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(...this.origin);
        ctx.lineTo(...this.endCoords());
        ctx.stroke();

        // this.updateAngle();
    }
}

window.record_frames = 0;
window.recording = [];
function main(canvas) {
    graph = {};
    points = [];

    canvas.height = 1020;
    canvas.width = 1020;
    ctx = canvas.getContext("2d");
    // ctx.fillStyle = "black";
    // ctx.beginPath();
    // ctx.rect(0, 0, 1000, 1000);
    // ctx.fill();

    const clocks = [];
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 20; j++) {
            clocks.push(new Clock(
                [(i + 1) * 1000 / 25, (j + 1) * 1000 / 20],
                20));
        }
    }

    window.setAllClocks = (angle) => {
        for (let clock of clocks)
            clock.setAngle(angle);
    }

    // window.setPos = (coords) => {
    //     for (let clock of clocks) {
    //         let angle = Math.atan2(coords[1] - clock.origin[1], coords[0] - clock.origin[0]);
    //         clock.setAngle(angle);
    //     }
    // }

    const draw = () => {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        for (let clock of clocks) {
            clock.draw(ctx);
            clock.setAngle(clock.angle + clock.speed);
        }
        if (window.record_frames) {
            window.recording.push(ctx.canvas.toDataURL());
            window.record_frames--;
        }
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
}
