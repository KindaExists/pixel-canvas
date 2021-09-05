
// Misc Setup
const body = document.body;
const drawArea = document.querySelector('#draw_area');


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

    btnHeld: {
        left: false,
        middle: false,
        right: false,
    },

    updatePos(evt, zoom) {
        this.x = evt.pageX;
        this.y = evt.pageY;
        this.canvas.x = (evt.pageX - cv.info.rect.left - (zoom / 2) - 1) / zoom;
        this.canvas.y = (evt.pageY - cv.info.rect.top - (zoom / 2) - 1) / zoom;
    },
};


cv.group.addEventListener('click', evt => {
    mouse.updatePos(evt, cv.info.zoom);
    canvasCtrl.drawPixel(ctx.main, [mouse.canvas.x, mouse.canvas.y], cv.info.zoom)
});

cv.group.addEventListener('mousemove', evt => {
    mouse.updatePos(evt, cv.info.zoom);

    if (mouse.btnHeld.left) {
        canvasCtrl.drawPixel(ctx.main, [mouse.canvas.x, mouse.canvas.y], 0);
    } else if (mouse.btnHeld.right) {
        canvasCtrl.drawPixel(ctx.main, [mouse.canvas.x, mouse.canvas.y], 1);
    }
});

body.addEventListener('mousedown', evt => {
    if (evt.button === 0) {
        mouse.btnHeld.left = true;
    } else if (evt.button === 2) {
        mouse.btnHeld.right = true;
    }
});

body.addEventListener('mouseup', evt => {
    if (evt.button === 0) {
        mouse.btnHeld.left = false;
    } else if (evt.button === 2) {
        mouse.btnHeld.right = false;
    }
});

drawArea.addEventListener('wheel', evt => {
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
    function drawPixel(ctx, pos, colorType) {
        ctx.fillStyle = (colorType === 1) ? pencil.secondary : pencil.primary;
        ctx.fillRect(pos[0], pos[1], pencil.size, pencil.size);
    }

    function changeZoom(cvs, direction, baseSize) {
        if ((cvs.info.zoom < cvs.info.maxZoom && direction > 0) || (cvs.info.zoom > cvs.info.minZoom && direction < 0)) {
            if (direction > 0) {
                cvs.info.zoom *= 2;
            } else {
                cvs.info.zoom /= 2;
            }
            const newWidth = baseSize[0] * cvs.info.zoom;
            const newHeight = baseSize[1] * cvs.info.zoom;
            document.documentElement.style.setProperty('--canvas-width', `${newWidth}px`);
            document.documentElement.style.setProperty('--canvas-height', `${newHeight}px`);

            cvs.generateNewRect();
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