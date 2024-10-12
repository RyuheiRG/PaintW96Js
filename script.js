// UTILITIES
const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

// CONSTANTS
const MODES = {
    DRAW: 'draw',
    PICKER: 'picker',
    RECTANGLE: 'rectangle',
    ERASE: 'erase',
    ELLIPSE: 'ellipse'
}

const SECONDMODE = {
    NORMAL: 'normal',
    BORDER: 'border',
    FILL: 'fill'
}

// ELEMENTS
const $colorPicker = $('#color-picker')
const $clearBtn = $('#clear-btn')
const $rectangleBtn = $('#rectangle-btn')
const $drawBtn = $('#draw-btn')
const $eraseBtn = $('#erase-btn')
const $pickerBtn = $('#picker-btn')
const $ellipseBtn = $('#ellipse-btn')
const $normalModeBtn = $('#normal-mode')
const $borderModeBtn = $('#border-mode')
const $fillModeBtn = $('#fill-mode')
const $canvas = $('#canvas')

const ctx = $canvas.getContext('2d')

// STATE
let isDrawing = false
let isShiftPress = false
let startX, startY
let lastX = 0
let lastY = 0
let mode = MODES.DRAW
let secondMode = SECONDMODE.NORMAL
let imageData

// EVENTS
$canvas.addEventListener('mousedown', startDrawing)
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mouseup', stopDrawing)
$canvas.addEventListener('mouseleave', stopDrawing)

$colorPicker.addEventListener('change', handlePickerColor)
$clearBtn.addEventListener('click', clearCanvas)



document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

$rectangleBtn.addEventListener('click', () => {
    setMode(MODES.RECTANGLE)
})

$drawBtn.addEventListener('click', () => {
    setMode(MODES.DRAW)
})

$eraseBtn.addEventListener('click', () => {
    setMode(MODES.ERASE)
})

$pickerBtn.addEventListener('click', () => {
    setMode(MODES.PICKER)
})

$ellipseBtn.addEventListener('click', () => {
    setMode(MODES.ELLIPSE)
})

// METHODS
function startDrawing(event) {
    isDrawing = true

    const { offsetX, offsetY } = event;

    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];

    imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
    );
}

function draw(event) {
    if(!isDrawing) return

    const { offsetX, offsetY } = event

    if(mode === MODES.DRAW || mode === MODES.ERASE) {
       // comenzar un trazo
        ctx.beginPath()

        // mover el trazado a las coordenadas actuales
        ctx.moveTo(lastX, lastY)

        // dibujar una linea entre coordenadas actuales y las nuevas
        ctx.lineTo(offsetX, offsetY)

        ctx.stroke()

        // actualizar las ultimas coordenadas
        ;[lastX, lastY] = [offsetX,offsetY] 
    }

    if(mode === MODES.RECTANGLE) {
        ctx.putImageData(imageData, 0, 0)
        // startX --> coordenada inicial del click
        let width = offsetX - startX
        let height = offsetY - startY

        // const { value } = $colorPicker

        if(isShiftPress) {
            const sideLenght = Math.min(
                Math.abs(width),
                Math.abs(height)
            )

            width = width > 0 ? sideLenght : -sideLenght
            height = height > 0 ? sideLenght : -sideLenght
        }

        ctx.beginPath()
        ctx.rect(startX, startY, width, height)
        // ctx.fillStyle = value
        // ctx.fill()
        ctx.stroke()
        return
    }

    if(mode === MODES.ELLIPSE) {
        ctx.putImageData(imageData, 0, 0)
        // startX --> coordenada inicial del click
        let width = offsetX - startX
        let height = offsetY - startY

        let radiusX = width - height
        let radiusY = width - height + 24
        let rotation = Math.PI / width - height

        if(radiusX < 0 || !radiusX) {
            radiusX = radiusX * -1
        } 
        if (radiusY < 0 || !radiusY){
            radiusY = radiusY * -1
        }

        if(isShiftPress) {
            const sideLenght = Math.min(
                Math.abs(width),
                Math.abs(height)
            )

            width = width > 0 ? sideLenght : -sideLenght
            height = height > 0 ? sideLenght : -sideLenght
        }

        ctx.beginPath()
        ctx.ellipse(startX, startY, radiusX, radiusY, rotation, 0, 2 * Math.PI)
        ctx.stroke()
        return
    }
}

function stopDrawing() {
    isDrawing = false
}

function handlePickerColor() {
    const { value } = $colorPicker

    ctx.strokeStyle = value
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

async function setMode(newMode) {
    let prevMode = mode
    mode = newMode

    $('button.active')?.classList.remove('active')

    if(mode === MODES.DRAW) {
        $drawBtn.classList.add('active')
        canvas.style.cursor = 'url(./assets/cursors/pincel.png) 0 24, auto'
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
        return
    }

    if(mode === MODES.RECTANGLE) {
        $rectangleBtn.classList.add('active')
        canvas.style.cursor = "nw-resize"
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
        return
    }

    if(mode === MODES.ELLIPSE) {
        $ellipseBtn.classList.add('active')
        canvas.style.cursor = "nw-resize"
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
        return
    }

    if(mode === MODES.ERASE) {
        $eraseBtn.classList.add('active')
        canvas.style.cursor = 'url(./assets/cursors/erase.png) 0 24, auto'
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = 20
        return
    }

    if(mode === MODES.PICKER) {
        $pickerBtn.classList.add('active')
        const eyeDropper = new window.EyeDropper()

        try {
            const result = await eyeDropper.open()
            const { sRGBHex } = result
            ctx.strokeStyle = sRGBHex
            $colorPicker.value = sRGBHex
            setMode(prevMode)
        } catch (error) {}

    return
    }
}

function handleKeyDown({ key }) {
    isShiftPress = key === 'Shift'
}

function handleKeyUp({ key }) {
    if(key === 'Shift') isShiftPress = false
}

// INIT
setMode(MODES.DRAW)

if(typeof window.EyeDropper !== 'undefined') {
    $pickerBtn.removeAttribute('disabled')
}
