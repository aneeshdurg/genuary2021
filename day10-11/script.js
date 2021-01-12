const colors = ["#ff0000", "#00ff00", "#0000ff"];
function get_random_color() {
    return colors[Math.floor(Math.random() * 3)];
}


class Point {
    constructor(position, velocity) {
        this.position = position;
        this.color = get_random_color();
        this.velocity = velocity;
    }
}

class AudioTree {
    volume = 0;
    vthresh = 80;
    vscale = 5;
    points = [];

    constructor(target) {
        this.vol = document.createElement('code');

        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.width = "100%";
        this.ctx = canvas.getContext("2d");

        target.appendChild(this.vol);
        target.appendChild(document.createElement('br'));
        target.appendChild(canvas);

        const threshold_label = document.createElement('label');
        threshold_label.for = 'threshold_input';
        threshold_label.innerText = 'Volume trigger: ';
        const threshold_input = document.createElement('input');
        threshold_input.id = 'threshold_input';
        threshold_input.type = 'number';
        threshold_input.value = this.vthresh;
        threshold_input.min = 0;
        threshold_input.step = 1;
        threshold_input.addEventListener('change', () => {
            this.vthresh = Math.floor(threshold_input.value);
        });
        target.appendChild(document.createElement('br'));
        target.appendChild(threshold_label);
        target.appendChild(threshold_input);

        const scale_label = document.createElement('label');
        scale_label.for = 'scale_input';
        scale_label.innerText = 'Branch scaling factor: ';
        const scale_input = document.createElement('input');
        scale_input.id = 'scale_input';
        scale_input.type = 'number';
        scale_input.value = this.vscale;
        scale_input.min = 1;
        scale_input.step = 1;
        scale_input.addEventListener('change', () => {
            this.vscale = Math.floor(scale_input.value);
        });
        target.appendChild(document.createElement('br'));
        target.appendChild(scale_label);
        target.appendChild(scale_input);


        const reset = document.createElement('button');
        reset.innerText = 'Clear';
        reset.addEventListener('click', () => {
            this.reset();
        });
        target.appendChild(document.createElement('br'));
        target.appendChild(reset);

        this.reset();

        this.start_microphone();
        this.draw();
    }

    reset() {
        this.points = [
            new Point([this.ctx.canvas.width / 2, this.ctx.canvas.height], [0, -1]),
        ];

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    async start_microphone() {
        try {
            // https://stackoverflow.com/a/52952907
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const audioContext = new AudioContext();
            const analyzer = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyzer.smoothingTimeConstant = 0.8;
            analyzer.fftSize = 1024;

            microphone.connect(analyzer);
            analyzer.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);
            javascriptNode.onaudioprocess = () => {
                var array = new Uint8Array(analyzer.frequencyBinCount);
                analyzer.getByteFrequencyData(array);

                var length = array.length;
                let values = 0;
                for (var i = 0; i < length; i++)
                    values += array[i];
                this.volume = values / length;
                this.vol.innerText = `Volume: ${this.volume}`;
            }

        } catch(err) {
            alert("Error getting audio: ", err);
            console.log(err);
        }
    }

    draw() {
        for (let i = 0; i < Math.min(this.points.length, 200); i++) {
            const pt = this.points[Math.floor(this.points.length * Math.random())];
            this.ctx.beginPath();
            this.ctx.moveTo(...pt.position);
            this.ctx.strokeStyle = pt.color;

            const multiplier = Math.max(Math.min(this.volume / this.vthresh, 2), 0.05)
            pt.position = pt.position.map((x, i) => x + multiplier * pt.velocity[i])
            this.ctx.lineTo(...pt.position);
            this.ctx.stroke();

            let new_vel = [...pt.velocity];
            pt.velocity[0] += (Math.random() - 0.5) / 10;
            pt.velocity[1] += (Math.random() - 0.5) / 10;
        }

        if (this.volume > this.vthresh) {
            const count = Math.min(1, Math.ceil((this.volume - this.vthresh) / this.vscale));
            console.log(count);

            for (let i = 0; i < count; i++) {
                const pt = this.points[Math.floor(this.points.length * Math.random())];

                let new_vel = [...pt.velocity];
                pt.velocity[0] += (Math.random() - 0.5) / 2;
                pt.velocity[1] += (Math.random() - 0.5) / 2;

                const new_pt = new Point([...pt.position], new_vel);
                this.points.push(new_pt);
            }
        }

        requestAnimationFrame(() => { this.draw(); });
    }
}
