
// Misc Setup
const body = document.body;
const maxZoom = 32;
const minZoom = 2;
let zoom = 8;


// Pencil Settings
const pencil = {
    primary: '#000000',
    secondary: '#FFFFFF',
    size: 1,
};


// Canvas Setup
const cv = {
    group: document.querySelector('#canvas_group'),

    bg: document.querySelector('#bg_canvas'),
    main: document.querySelector('#main_canvas'),
    fg: document.querySelector('#fg_canvas'),
    debug: document.querySelector('#debug_canvas'),

    info: {
        zoom: 8,
        maxZoom: 32,
        minZoom: 4,

        rect: undefined,
    },

    generateNewRect() {
        this.info.rect = cv.main.getBoundingClientRect();
    },
};


const ctx = {
    bg: cv.bg.getContext("2d"),
    main: cv.main.getContext("2d"),
    fg: cv.fg.getContext("2d"),
    debug: cv.debug.getContext("2d"),

    disableAllSmoothing() {
        this.main.imageSmoothingEnabled = false;
        this.debug.imageSmoothingEnabled = false;
    }
};


// Mouse Events
const mouse = {
    x: undefined,
    y: undefined,
    canvas: {
        x: undefined,
        y: undefined,
    },

    isHeld: false,

    updatePos(evt, zoom) {
        this.x = evt.pageX;
        this.y = evt.pageY;
        this.canvas.x = (evt.pageX - cv.info.rect.left - (zoom / 2) - 1) / zoom;
        this.canvas.y = (evt.pageY - cv.info.rect.top - (zoom / 2) - 1) / zoom;
    },
};


cv.group.addEventListener('click', evt => {
    mouse.updatePos(evt, zoom);
    canvasCtrl.drawPixel(ctx.main, [mouse.canvas.x, mouse.canvas.y], zoom)
});

cv.group.addEventListener('mousemove', evt => {
    if (mouse.isHeld) {
        mouse.updatePos(evt, zoom);
        canvasCtrl.drawPixel(ctx.main, [mouse.canvas.x, mouse.canvas.y])
    }
});

body.addEventListener('mousedown', evt => {
    mouse.isHeld = true;
});

body.addEventListener('mouseup', evt => {
    mouse.isHeld = false;
});

body.addEventListener('wheel', evt => {
    const direction = (evt.wheelDelta > 0) ? 1 : -1;
    canvasCtrl.changeZoom(cv, direction, [cv.main.width, cv.main.height]);
});


// Stops context menu from opening when using secondary brush (will be added later)
cv.group.addEventListener('contextmenu', (e) => ( e.preventDefault() ), false)


// Settings Events
const primaryPicker = document.querySelector('#primary');
primaryPicker.addEventListener('input', evt => {
    pencil.primary = evt.target.value;
});

const secondaryPicker = document.querySelector('#secondary')
secondaryPicker.addEventListener('input', evt => {
    pencil.secondary = evt.target.value;
});


// Canvas Controller
const canvasCtrl = (() => {
    // Review (floored) "Bresenham Line algorithm" to avoid point skipping
    function drawPixel(ctx, pos, brushType) {
        ctx.fillStyle = pencil.primary;
        ctx.fillRect(pos[0], pos[1], pencil.size, pencil.size)
    }

    function changeZoom(canvases, direction, baseSize) {
        if ((zoom < maxZoom && direction > 0) || (zoom > minZoom && direction < 0)) {
            if (direction > 0) {
                zoom *= 2;
            } else {
                zoom /= 2;
            }
            const newWidth = baseSize[0] * zoom;
            const newHeight = baseSize[1] * zoom;
            document.documentElement.style.setProperty('--canvas-width', `${newWidth}px`);
            document.documentElement.style.setProperty('--canvas-height', `${newHeight}px`);

            canvases.generateNewRect();
        }
    }

    return {
        drawPixel, changeZoom
    };
})();



window.addEventListener('load', setup, false);

function setup() {
    cv.generateNewRect();
    ctx.disableAllSmoothing();

    if (ctx.main === null) {
        alert("Unable to initialize Canvas. Your browser or machine may not support it.");
    }
}