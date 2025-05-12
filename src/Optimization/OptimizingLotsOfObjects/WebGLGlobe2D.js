export default function WebGLGlobe2D() {

    async function loadFile(url) {
        const req = await fetch(url);
        return req.text();
    }

    function parseData(text) {
        const data = [];
        const settings = {data};
        let min, max;

        text.split('\n').forEach((line) => {
            const parts = line.trim().split(/\s+/);

            if (parts.length === 2) {
                settings[parts[0]] = parseFloat(parts[1]);
            } else if (parts.length > 2) {
                const values = parts.map((v) => {
                    const value = parseFloat(v);
                    if (value === settings.NODATA_value) {
                        return undefined;
                    }
                    max = Math.max(max === undefined ? value : max, value);
                    min = Math.min(min === undefined ? value : min, value);
                    return value;
                })
                data.push(values);
            }
        });

        return Object.assign(settings, {min, max})
    }

    function drawData(file) {
        const {min, max, data, ncols, nrows} = file;
        const range = max - min;

        const ctx = document.querySelector('canvas').getContext('2d');
        ctx.canvas.width = ncols;
        ctx.canvas.height = nrows;

        ctx.canvas.style.width = px(ncols * 2);
        ctx.canvas.style.height = px(nrows * 2);

        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        data.forEach((row, latNdx) => {
            row.forEach((value, lonNdx) => {
                if (value === undefined) {
                    return;
                }

                const amount = (value - min) / range;
                const hue = 1;
                const saturation = 1;
                ctx.fillStyle = hsl(hue, saturation, amount);
                ctx.fillRect(lonNdx, latNdx, 1, 1);
            });
        });
    }

    function px(v) {
        return `${v | 0}px`;
    }

    function hsl(h, s, l) {
        return `hsl(${h * 360 | 0},${s * 100 | 0}%,${l * 100 | 0}%)`;
    }


    loadFile('https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
        .then(parseData)
        .then(drawData);
}