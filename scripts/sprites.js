const fs = require("fs");
const path = require("path");
const GifEncoder = require("gif-encoder");
const PNG = require("pngjs").PNG;

let width;
let height;

const columnStarts = [0, 350, 730];

const inFile = path.resolve("sprites.png");
const outdir = path.resolve("sprites");

const roboponFile = path.resolve("robopon.json");
let robodata;
let roboponIndex = 1;

main();

async function main() {
    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
    }

    robodata = JSON.parse(fs.readFileSync(roboponFile));

    const png = await readPNG(inFile);
    width = png.width;
    height = png.height;
    const pixels = png.pixels;

    columnStarts.push(width);

    for (let i = 0; i < 3; i++) {
        parseColumn(pixels, columnStarts[i], columnStarts[i + 1])
    }
}

function readPNG(src) {
    return new Promise(resolve => {
        fs.createReadStream(src)
            .pipe(new PNG())
            .on("parsed", function () {
                resolve({
                    width: this.width,
                    height: this.height,
                    pixels: this.data
                });
            })
    });
}

function writeGIF(dest, frames) {
    let width = frames[0].width;
    let height = frames[0].height;

    for (const frame of frames) {
        width = Math.max(width, frame.width);
        height = Math.max(height, frame.height);
    }

    const gif = new GifEncoder(width, height);

    const out = fs.createWriteStream(dest);
    gif.pipe(out);
    gif.writeHeader();
    gif.setQuality(1);
    gif.setDelay(200);
    gif.setTransparent(0x123456);
    gif.setRepeat(0);

    for (const frame of frames) {
        const pixels = Buffer.alloc((width * height) << 2);
        const minX = (width >> 1) - (frame.width >> 1);
        const minY = (height >> 1) - (frame.height >> 1);

        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 0x12;
            pixels[i + 1] = 0x34;
            pixels[i + 2] = 0x56;
        }

        for (let x = 0; x < frame.width; x++) {
            for (let y = 0; y < frame.height; y++) {
                const sourceIndex = (x + y * frame.width) << 2;
                const destIndex = (minX + x + (minY + y) * width) << 2;
                if (frame.pixels[sourceIndex + 3] === 0) {
                    pixels[destIndex] = 0x12;
                    pixels[destIndex + 1] = 0x34;
                    pixels[destIndex + 2] = 0x56;
                }
                else {
                    for (let i = 0; i < 4; i++) {
                        pixels[destIndex + i] = frame.pixels[sourceIndex + i];
                    }
                }
            }
        }

        gif.addFrame(pixels);
    }

    gif.finish();
}

function writePNG(dest, png) {
    const p = new PNG({
        width: png.width,
        height: png.height,
        data: png.pixels
    });
    p.data = png.pixels;
    fs.writeFileSync(dest, PNG.sync.write(p))
}

function parseColumn(pixels, startX, endX) {
    let lastEmptyRow = 0;

    for (let y = 0; y < height; y++) {
        let isEmpty = true;

        for (let x = startX; x < endX; x++) {
            if (!isBackground(pixels, x, y)) {
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            if (y - lastEmptyRow > 5) {
                if (roboponIndex === 145) {
                    processSprite(pixels, startX, lastEmptyRow, endX, lastEmptyRow + 40);
                    processSprite(pixels, startX, lastEmptyRow + 42, startX + 200, lastEmptyRow + 96);
                }
                else {
                    processSprite(pixels, startX, lastEmptyRow, endX, y);
                }
            }
            lastEmptyRow = y;
        }
    }
}

function processSprite(pixels, x0, y0, x1, y1) {
    console.log(`(${x0} ${y0}) (${x1} ${y1})`)
    let lastEmptyColumn = x0;

    const robopon = robodata.robopon.find(d => d.id === roboponIndex);
    if (!robopon) return;

    console.log(robopon.name + " (" + robopon.id + ")");

    const frames = [];

    for (let x = x0; x < x1; x++) {
        let isEmpty = true;

        for (let y = y0; y < y1; y++) {
            if (!isBackground(pixels, x, y)) {
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            if (x - lastEmptyColumn > 1) {
                if (roboponIndex === 145 && frames.length === 4) {
                    frames.push(extractFrame(pixels, lastEmptyColumn, y0, x, y1 + 8))
                }
                else {
                    frames.push(extractFrame(pixels, lastEmptyColumn, y0, x, y1))
                }
            }
            lastEmptyColumn = x;
        }
    }

    const namePrefix = String(robopon.id).padStart(3, "0") + "_" + robopon.name;

    writePNG(path.join(outdir, namePrefix + "_tiny.png"), frames[0]);
    writePNG(path.join(outdir, namePrefix + "_large.png"), frames[1]);
    writeGIF(path.join(outdir, namePrefix + "_animated.gif"), frames.slice(1));

    roboponIndex++;
    if (roboponIndex === 165) {
        // riderv missing sprite
        roboponIndex++;
    }
}

function extractFrame(pixels, x0, y0, x1, y1) {
    let minX = x1;
    let maxX = x0;
    let minY = y1;
    let maxY = y0;

    for (let x = x0; x < x1; x++) {
        for (let y = y0; y < y1; y++) {
            if (!isBackground(pixels, x, y)) {
                minX = Math.min(x, minX);
                maxX = Math.max(x, maxX);
                minY = Math.min(y, minY);
                maxY = Math.max(y, maxY);
            }
        }
    }

    const frameWidth = maxX - minX + 1;
    const frameHeight = maxY - minY + 1;

    const framePixels = Buffer.alloc(frameWidth * frameHeight * 4);

    for (let x = 0; x < frameWidth; x++) {
        for (let y = 0; y < frameHeight; y++) {
            if (!isBackground(pixels, minX + x, minY + y)) {
                const destIndex = (x + y * frameWidth) << 2;
                const sourceIndex = ((minX + x) + (minY + y) * width) << 2;

                for (let i = 0; i < 4; i++) {
                    framePixels[destIndex + i] = pixels[sourceIndex + i]
                }
            }
        }
    }

    return {
        width: frameWidth,
        height: frameHeight,
        pixels: framePixels
    };
}


function isBackground(pixels, x, y) {
    const start = (y * width + x) << 2;

    for (let i = 0; i < 4; i++) {
        if (pixels[i] !== pixels[start + i]) {
            return false;
        }
    }
    return true;
}