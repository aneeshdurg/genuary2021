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

function expand(ruleset, cache, rule, maxlevel, level) {
    level = level || 0;
    if (level > maxlevel)
        return [rule];

    const key = `${rule}${maxlevel - level}`;
    if (cache.has(key))
        return [...cache.get(key)];

    let expanded = [];
    console.log("expanding", rule, maxlevel, level);
    ruleset.productions[rule].split('').forEach((r) => {
        if (ruleset.consonants.has(r)) {
            expanded.push(r);
            return;
        }

        expanded = expanded.concat(expand(ruleset, cache, r, maxlevel, level + 1));
    });

    cache.set(key, expanded);
    return expanded;
}

async function draw(ruleset, ctx, rules, sparse) {
    let position = [ctx.canvas.width / 2, ctx.canvas.height / 2];
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
    ctx.moveTo(...position);

    const do_draw = async (r) => {
        if (r === '+')
            add_direction();
        else if (r === '-')
            dec_direction();
        else if (r === 'F') {
            ctx.strokeStyle = get_random_color();
            ctx.beginPath();
            ctx.moveTo(...position);
            dest = position.map((x, i) => x + directions[direction][i]);
            ctx.lineTo(...dest);
            position = dest;
            ctx.stroke();
            if (window.animate)
                await new Promise(r => setTimeout(r, 0));
        }
    }

    for (let r of rules) {
        if (Math.random() < sparse) {
            const choices = Array.from(ruleset.consonants);
            const random = choices[Math.floor(Math.random() * choices.length)];
            await do_draw(random);
        }

        await do_draw(r);
    }
    console.log("DONE", color.toString(16));
}

function main(canvas, display, maxlevel, sparse) {
    const ruleset = {
        consonants: new Set(["F", "+", "-"]),
        productions: {
            A: "++BF--AFA--FB++",
            B: "--AF++BFB++FA--",
        }
    };

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
        }
    }

    const choices = [
        'F', 'F', 'F',
        '+', '+',
        '-', '-',
        'A',
        'B',
    ];

    let pA = favorites.octagonmachine.A;
    let pB = favorites.octagonmachine.B;
    //let pA = "";
    //let pB = "";

    //let AsymCount = 0;
    //let BsymCount = 0;
    //for (let i = 0; i < 10; i++) {
    //    console.log('g', i);
    //    const getChoice = (incCounter, getCounter) => {
    //        let choice = 'F';
    //        while (true) {
    //            choice = choices[Math.floor(Math.random() * choices.length)];
    //            if (choice === 'A' || choice === 'B') {
    //                if (getCounter == 4)
    //                    continue;
    //                incCounter();
    //            }
    //            break;
    //        }
    //        return choice;
    //    };
    //    pA += getChoice(() => { AsymCount++; }, () => AsymCount);
    //    pB += getChoice(() => { BsymCount++; }, () => BsymCount);
    //}
    console.log(pA, pB);
    ruleset.productions.A = pA;
    ruleset.productions.B = pB;

    display.innerHTML = `A -> ${pA} <br>B -> ${pB}`;



    const expanded = expand(ruleset, new Map(), 'A', maxlevel);

    console.log(expanded);

    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    draw(ruleset, ctx, expanded, sparse);
}
