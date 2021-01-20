function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

class LineSegment {
    m = 0;
    c = 0;
    start = 0;
    end = 0;

    constructor(pt1, pt2) {
        if (pt1[0] == pt2[0]) {
            this.m = NaN;
        } else {
            this.m = (pt1[1] - pt2[1]) / (pt1[0] - pt2[0]);
            this.c = pt1[1] - this.m * pt1[0];
        }

        this.start = Math.min(pt1[0], pt2[0]);
        this.end = Math.max(pt1[0], pt2[0]);
    }

    is_valid(x) {
        return x > this.start && x < this.end;
    }

    intersects(other) {
        /* Solve the equation:
         *   m1 * x + c1 = m2 * x + c2
         *   (m1 - m2) * x  = c2 - c1
         *   x = (c2 - c1) / (m1 - m2)
        */

        const x = (other.c - this.c) / (this.m - other.m);
        return this.is_valid(x) && other.is_valid(x);
    }
}

function intersects(points, edge1, edge2) {
    const seg1 = new LineSegment(...edge1.map(x => points[x]));
    const seg2 = new LineSegment(...edge2.map(x => points[x]));
    return seg1.intersects(seg2);
}

function length_sqrd(pt1, pt2) {
    return pt1.map((x, i) => x - pt2[i]).reduce((x, y) => x + y * y);
}

window.graph = {};
window.points = [];
window.ctx = null;

const draw = () => {
    if (window.record_frames) {
        window.record_frames--;
        window.recording.push(web.ctx.canvas.toDataURL());
    }

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fill();

    for (let i = 0; i < points.length; i++) {
        let pt = points[i];
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.arc(...pt, 10, 0, 2 * Math.PI);
        ctx.stroke();

        if (!(i in graph))
            continue;

        ctx.strokeStyle = "#ff00ff";
        for (let j of graph[i]) {
            let end = points[j];
            ctx.beginPath();
            ctx.moveTo(...pt);
            ctx.lineTo(...end);
            ctx.stroke();
        }
    }
};

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

    for (let i = 0; i < (2 + Math.random() * 98); i++) {
        points.push([canvas.width, canvas.height].map(x => Math.floor(Math.random() * x)));
    }

    for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        for (let j = 0; j < points.length; j++) {
            if (j == i)
                continue;

            const tentative_edge = [i, j];

            let conflicts = false;
            for (let key of Object.keys(graph)) {
                for (let target of graph[key]) {
                    const curr_edge = [key, target];
                    if (intersects(points, tentative_edge, curr_edge)) {
                        conflicts = true;
                        break;
                    }
                }

                if (conflicts)
                    break;
            }

            if (conflicts)
                continue;

            // Add tentative_edge to graph
            if (!(i in graph))
                graph[i] = [];
            graph[i].push(j);

            if (!(j in graph))
                graph[j] = [];
            if (graph[j].indexOf(i) < 0)
                graph[j].push(i);
        }
    }

    draw();
    draw_mst(0);

}

async function draw_mst(x) {
    // ctx.fillStyle = "black";
    // ctx.beginPath();
    // ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fill();

    const visited_set = new Set();

    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.arc(...points[x], 10, 0, 2 * Math.PI);
    ctx.stroke();

    function get_dist(x, y) {
        const pt_x = points[x];
        const pt_y = points[y];

        return pt_x.map((x, i) => x - pt_y[i]).map(x => x * x).reduce((x, y) => x + y);
    }

    visited_set.add(x);
    let curr_edges = [...graph[x].map(y => [x, y])];
    while (curr_edges.length && visited_set.size != points.length) {
        let min_edge = -1;
        let min_dist = Infinity;
        for (let i = 0; i < curr_edges.length; i++) {
            if (visited_set.has(curr_edges[i][1]))
                continue;

            let d = get_dist(...curr_edges[i]);
            if (d < min_dist) {
                min_edge = i;
                min_dist = d;
            }
        }

        if (min_edge == -1)
            break;

        const edge = curr_edges[min_edge];

        visited_set.add(edge[0]);
        visited_set.add(edge[1]);

        ctx.lineWidth = 5;
        ctx.strokeStyle = "#00ffff";
        ctx.beginPath();
        ctx.moveTo(...points[edge[0]]);
        ctx.lineTo(...points[edge[1]]);
        ctx.stroke();

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.arc(...points[edge[0]], 10, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(...points[edge[1]], 10, 0, 2 * Math.PI);
        ctx.stroke();

        for (let child of graph[edge[1]]) {
            if (!visited_set.has(child))
                curr_edges.push([edge[1], child])
        }
        curr_edges.splice(min_edge, 1);
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(visited_set.size);
}
