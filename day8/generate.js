let color = 0;
let s = 0.5;
function get_random_color() {
    color += 1;
    if (color == 360) {
        s += 0.1;
        if (s == 1)
            s = 0;
    }
    const rgb = HSVtoRGB(color / 360, s, 0.5);
    const r = rgb.r.toString(16);
    const g = rgb.g.toString(16);
    const b = rgb.b.toString(16);
    return `#${r}${g}${b}`;
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

const favorites = {
    hilbert: {
        A: "++BF--AFA--FB++",
        B: "--AF++BFB++FA--",
    },
    blocks: {
        A: "FF--F--A++A",
        B: "",
    },
    sword: {
        A: "-FF+FBFAFF++FA",
        B: "FBFF+FFFF+FF++BBBB",
    },
    squares: {
        A: "FB---F-FF+BFA+AFFF",
        B: "FFF+F-F--BFFBFBF",
    },
    loops: {
        A: "+F-A+FBBFB",
        B: "AB-++FB+-A",
    },
    blocks2: {
        A: "A++FAF-+AF",
        B: "B+B-+--FBA",
    },
    octagonmachine: {
        A: "F++BFB+A++",
        B: "F+-FFB+F+F",
    },
    spiky: {
        A: "BFAB-B+F-B",
        B: "++BFF++B-+",
    },
    dragon: {
        A: "A++BF++",
        B: "--FA--B",
    },
    koch: {
        A: "AF++AF----AF++AF",
        B: "",
    },
    denseOctagon: {
        A: "AFBFBFFF",
        B: "-BF+FB+B",
    },
    blocks3: {
        A: "A--FBFFF",
        B: "FBBF--",
    }
};

const choices = [
    'F', 'F', 'F',
    '+', '+',
    '-', '-',
    'A',
    'B',
];

class LSystemGenerator {
    ruleset = {
        consonants: new Set(["F", "+", "-"]),
        productions: {
            A: "",
            B: "",
        }
    };
    animate = false;
    maxlevel = 7;
    cache = new Map();
    randomize = 0;
    inprogress = undefined;

    constructor(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.width = "100%";
        this.ctx = canvas.getContext("2d");
        this.display = document.createElement('code');
        this.maxlevel = 7;
        this.animate = false;
        this.randomize = 0;
        this.generate_random_ruleset();

        const animateselectlabel = document.createElement('label');
        animateselectlabel.for = 'animateselect';
        animateselectlabel.innerText = "Animate: ";
        const animateselect = document.createElement('input');
        animateselect.id = 'animateselect';
        animateselect.type = 'checkbox';
        animateselect.addEventListener('change', async () => {
            await this.clear_in_progress();
            this.animate = animateselect.checked;
            this.draw();
        });

        const levelselectlabel = document.createElement('label');
        levelselectlabel.for = 'levelselect';
        levelselectlabel.innerText = "Max recursion depth: ";
        const levelselect = document.createElement('input');
        levelselect.id = 'levelselect';
        levelselect.type = 'number';
        levelselect.min = 0;
        levelselect.value = 7;
        levelselect.addEventListener('change', async () => {
            await this.clear_in_progress();
            this.maxlevel = Math.floor(levelselect.value);
            this.draw();
        });

        const randomselectlabel = document.createElement('label');
        randomselectlabel.for = 'randomselect';
        randomselectlabel.innerText = "Random perturbation change: ";
        const randomselect = document.createElement('input');
        randomselect.id = 'randomselect';
        randomselect.type = 'number';
        randomselect.min = 0;
        randomselect.max = 1;
        randomselect.step = 0.01;
        randomselect.value = 0;
        randomselect.addEventListener('change', async () => {
            await this.clear_in_progress();
            this.randomize = randomselect.value;
            this.draw();
        });

        const resetDefault = () => {
            this.maxlevel = 7;
            levelselect.value = 7;
            this.randomize = 0;
            randomselect.value = 0;

        };

        const favoriteslabel = document.createElement('label');
        favoriteslabel.for = 'favoriteselect';
        favoriteslabel.innerText = 'Choose a pre-defined L-System: ';
        const favoriteselect = document.createElement('select');
        favoriteselect.id = 'favoriteselect';
        let option = document.createElement('option');
        option.value = "";
        option.innerText = "";
        favoriteselect.appendChild(option);
        for (let name of Object.keys(favorites)) {
            option = document.createElement('option');
            option.value = name;
            option.innerText = name;
            favoriteselect.appendChild(option);
        }
        favoriteselect.addEventListener('change', async () => {
            if (favoriteselect.value) {
                await this.set_productions(favorites[favoriteselect.value]);
                resetDefault();
                this.draw();
            }
        });

        const generaterandom = document.createElement('button');
        generaterandom.innerText = 'Generate random rules';
        generaterandom.addEventListener('click', async () => {
            await this.clear_in_progress();
            favoriteselect.value = "";
            resetDefault();
            this.generate_random_ruleset();
            this.draw();
        });


        container.appendChild(favoriteslabel);
        container.appendChild(favoriteselect);
        container.appendChild(document.createElement('br'));
        container.appendChild(this.display);
        container.appendChild(document.createElement('br'));
        container.appendChild(canvas);
        container.appendChild(document.createElement('br'));
        container.appendChild(animateselectlabel);
        container.appendChild(animateselect);
        container.appendChild(levelselectlabel);
        container.appendChild(levelselect);
        container.appendChild(generaterandom);
        container.appendChild(document.createElement('br'));
    }

    generate_random_ruleset() {
        let pA = "";
        let pB = "";

        let AsymCount = 0;
        let BsymCount = 0;
        for (let i = 0; i < 10; i++) {
            const getChoice = (incCounter, getCounter) => {
                let choice = 'F';
                while (true) {
                    choice = choices[Math.floor(Math.random() * choices.length)];
                    if (choice === 'A' || choice === 'B') {
                        if (getCounter == 4)
                            continue;
                        incCounter();
                    }
                    break;
                }
                return choice;
            };
            pA += getChoice(() => { AsymCount++; }, () => AsymCount);
            pB += getChoice(() => { BsymCount++; }, () => BsymCount);
        }
        console.log(pA, pB);
        this.set_productions({A: pA, B: pB});
    }

    async clear_in_progress() {
        if (this.inprogress) {
            const old_animate = this.animate;
            this.animate = false;
            await this.inprogress;
            this.animate = old_animate;

            this.inprogress = undefined;
        }
    }

    async set_productions(obj) {
        await this.clear_in_progress();
        this.ruleset.productions.A = obj.A;
        this.ruleset.productions.B = obj.B;
        this.display.innerHTML = `A -> ${obj.A} <br>B -> ${obj.B}`;

        this.cache = new Map();
    }

    expand(rule, level) {
        level = level || 0;
        if (level > this.maxlevel)
            return [rule];

        const key = `${rule}${this.maxlevel - level}`;
        if (this.cache.has(key))
            return [...this.cache.get(key)];

        let expanded = [];
        // console.log("expanding", rule, this.maxlevel, level);
        this.ruleset.productions[rule].split('').forEach((r) => {
            if (this.ruleset.consonants.has(r)) {
                expanded.push(r);
                return;
            }

            expanded = expanded.concat(this.expand(r, level + 1));
        });

        this.cache.set(key, expanded);
        return expanded;
    }

    async do_draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let rules = this.expand('A');

        let position = [this.ctx.canvas.width / 2, this.ctx.canvas.height / 2];
        let directions = [[0, 10], [-10, 10], [-10, 0], [-10, -10], [0, -10], [10, -10], [10, 0], [10, 10]];

        let direction = 0;
        const add_direction = () => {
            direction = (direction + 1) % directions.length;
       };
        const dec_direction = () => {
            direction = direction - 1;
            if (direction < 0)
                direction += directions.length;
        };
        this.ctx.moveTo(...position);

        const do_draw = async (r) => {
            if (r === '+')
                add_direction();
            else if (r === '-')
                dec_direction();
            else if (r === 'F') {
                this.ctx.strokeStyle = get_random_color();
                this.ctx.beginPath();
                this.ctx.moveTo(...position);
                let dest = position.map((x, i) => x + directions[direction][i]);
                this.ctx.lineTo(...dest);
                position = dest;
                this.ctx.stroke();
                if (this.animate)
                    await new Promise(r => setTimeout(r, 0));
            }
        }

        for (let r of rules) {
            if (Math.random() < this.randomize) {
                const choices_ = Array.from(ruleset.consonants);
                const random = choices_[Math.floor(Math.random() * choices_.length)];
                await do_draw(random);
            }

            await do_draw(r);
        }
    }

    async draw() {
        await this.clear_in_progress();
        this.inprogress = this.do_draw();
    }
}

function main(container) {
    const lsystem = new LSystemGenerator(container);
    lsystem.draw();
    window.lsystem = lsystem;
}
