let _images = 0;

window.record_frames = 0;
window.recording = [];

class LineArt {
    final_colors = [];

    animate = true;
    cancel_draw = false;
    draw_promise = null;

    ctx = null;

    picsumurl() {
        return `https://picsum.photos/1000?i=${_images++}`
    }

    constructor(target) {
        this.block_size_2 = this.block_size * this.block_size;
        this.width = 1000;
        this.height = 1000;
        this.url = this.picsumurl();

        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = "50%";
        this.ctx = canvas.getContext("2d");
        target.appendChild(canvas);

        this.img_container = document.createElement('div');
        this.img_container.style.width = "50%";
        this.img_container.style.display = "inline-block";
        target.appendChild(this.img_container);

        target.appendChild(document.createElement('br'));
        const url_label = document.createElement("label");
        url_label.innerText = "URL: ";
        const url_input = document.createElement("input");
        url_input.max = 200;
        url_input.min = 1;
        url_input.step = 1;
        url_input.value = this.url;
        url_input.addEventListener('change', () => {
            this.change_url(url_input.value);
        });
        target.appendChild(url_label);
        target.appendChild(url_input);

        const random_btn = document.createElement('button');
        random_btn.innerText = "Random Image";
        random_btn.addEventListener('click', () => {
            this.random_url();
        });
        target.appendChild(random_btn);

    }

    async getImage() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.url;
        img.style.display = 'none';
        img.style.width = '100%';
        this.img_container.appendChild(img);
        await (new Promise(r => img.onload = r));

        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = "100%";
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, this.width, this.height);

        img.style.display = "";
        console.log("DOWNLOADED");
        return ctx;
    }

    async generateFinal() {
        this.img_container.querySelectorAll("img").forEach(x => x.remove());
        const final_image = await this.getImage();

        this.final_data = final_image.getImageData(0, 0, this.width, this.height);
    }

    draw(resolver) {
        for (let i_ = 0; i_ < 1000; i_++) {
            let start = [this.width, this.height].map(x => Math.floor(Math.random() * x));

            // TODO max length
            let r = 10 + Math.random() * 10;
            let theta = Math.random() * 2 * Math.PI;

            let end = [Math.cos(theta), Math.sin(theta)].map((x, i) => Math.floor(r * x + start[i]));
            let color = [0, 0, 0];
            if (end[0] > 0 && end[0] < this.width && end[1] > 0 && end[1] < this.height) {
                const idx = 4 * (end[1] * this.width + end[0]);
                for (let i = 0; i < color.length; i++)
                    color[i] = this.final_data.data[idx + i];
            } else {
                continue;
            }

            this.ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            this.ctx.beginPath();
            this.ctx.moveTo(...start);
            this.ctx.lineTo(...end);
            this.ctx.stroke();
        }
        // console.log("DRAW", ...start, ...end, ...color);
        if (window.record_frames) {
            window.recording.push(this.ctx.canvas.toDataURL());
            window.record_frames--;
        }
        if (this.cancel_draw)
            resolver();
        else
            requestAnimationFrame(() => this.draw(resolver));
            //setTimeout(() => { requestAnimationFrame(() => this.draw(resolver)) }, 100);
    }

    async cancel_drawing() {
        if (!this.draw_promise)
            return;
        this.cancel_draw = true;
        await this.draw_promise;
        this.draw_promise = null;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.cancel_draw = false;
    }

    async generate_and_draw() {
        await this.cancel_drawing();
        console.log("done cancelling draw");

        await this.generateFinal();
        console.log("done regenerating");

        this.draw_promise = new Promise(r => { this.draw(r); });
    }

    async change_url(url) {
        console.log("Url is now", url);
        this.url = url;
        return this.generate_and_draw();
    }

    async random_url() {
        return this.change_url(this.picsumurl());
    }
}

async function main(target) {
    window.obj = new LineArt(target);
    obj.generate_and_draw();
}
