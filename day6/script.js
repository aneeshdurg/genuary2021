let volume = 0;
let enable_mic = false;
let enable_clock = false;
function main(canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 1000;

    const step = 50;
    const n = canvas.width / step;

    const points = [];
    const orig_points = [];
    let greens = [];
    for (let j = 0; j < canvas.height; j += step) {
        for (let i = 0; i < canvas.width; i += step) {
            points.push([i, j]);
            orig_points.push([i, j]);
            greens.push(0);
        }
    }

    const triangles = [];
    for (let i = 0; i < (canvas.width / step) - 1; i++) {
        for (let j = 0; j < (canvas.height / step) - 1; j++) {
            triangles.push([
                j * n + i,
                j * n + i + 1,
                (j + 1) * n + i,
            ]);

            triangles.push([
                j * n + i + 1,
                (j + 1) * n + i,
                (j + 1) * n + i + 1,
            ]);
        }
    }

    window.vthresh = 100;
    const f = (t) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let triangle of triangles) {
            const i = triangle[0] % n;
            const j = Math.floor(triangle[0] / n);
            const red = Math.floor(255 * i / n).toString(16).padStart(2, '0');
            const blue = Math.floor(255 * j / n).toString(16).padStart(2, '0');
            const green = greens[triangle[0]].toString(16).padStart(2, '0');
            ctx.fillStyle = `#${red}${green}${blue}`;

            const p0 = points[triangle[0]];
            const p1 = points[triangle[1]];
            const p2 = points[triangle[2]];

            const draw = () => {
                ctx.beginPath();
                ctx.moveTo(...p0);
                ctx.lineTo(...p1);
                ctx.lineTo(...p2);
                ctx.lineTo(...p0);
            };

            draw();
            ctx.stroke();
            draw();
            ctx.fill();
        }

        let clock = Math.sin(t/1000);
        let value = enable_mic ? (volume / window.vthresh) : (enable_clock ? clock : 0);
        let should_distort = false;
        if (enable_mic)
            should_distort = value > 1;
        if (enable_clock)
            should_distort = clock > 0;

        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < 2; j++) {
                if (should_distort) {
                    points[i][j] = points[i][j] + (3+value) * (2*Math.random() - 1);
                }  else {
                    let pt = points[i];
                    pt = [orig_points[i][0] - pt[0], orig_points[i][1] - pt[1]];
                    pt_len = Math.sqrt(pt[0] * pt[0] + pt[1] * pt[1]);
                    if (pt_len == 0)
                        continue;

                    points[i][j] = points[i][j] + pt[j] / pt_len;
                }
            }
        }


        requestAnimationFrame(f);
    };
    f(0);
}

let stream = null;
async function start_microphone(vdisp, vinput) {
    enable_clock = false;
    enable_mic = true;
    if (stream)
        return;
    try {
        // https://stackoverflow.com/a/52952907
        stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = new AudioContext();
        const analyzer = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyzer.smoothingTimeConstant = 0.8;
        analyzer.fftSize = 1024;

        microphone.connect(analyzer);
        analyzer.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = function() {
            var array = new Uint8Array(analyzer.frequencyBinCount);
            analyzer.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += (array[i]);
            }

            volume = values / length;
            vdisp.innerText = volume;
        }
    } catch(err) {
        alert("Error getting audio: ", err);
    }

    vinput.value = window.vthresh;
    vinput.addEventListener('change', () => {
        try {
            window.vthresh = parseFloat(vinput.value);
        } catch (e) {}
    });
}

function start_no_microphone() {
    enable_mic = false;
    enable_clock = true;
}
