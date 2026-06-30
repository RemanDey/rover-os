const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const telemetryText = document.getElementById('telemetry');
const telemetryStatus = document.getElementById('telemetry-status');

const wsX = document.getElementById('ws-x');
const wsY = document.getElementById('ws-y');
const wsTheta = document.getElementById('ws-theta');
const wsV = document.getElementById('ws-v');
const wsOmega = document.getElementById('ws-omega');
const wsCollision = document.getElementById('ws-collision');

const COLORS = {
    blue: '#0072BD',
    orange: '#D95319',
    yellow: '#EDB120',
    purple: '#7E2F8E',
    green: '#77AC30',
    lightBlue: '#4DBEEE',
    darkRed: '#A2142F',
    grid: '#e0e3e8',
    axis: '#b0b0b0'
};

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;

    const step = 50;
    for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

async function updateSimulation() {
    try {
        const response = await fetch('/api/state');
        if (!response.ok) throw new Error('Network error');
        const rover = await response.json();

        const degrees = ((rover.theta * 180) / Math.PI % 360).toFixed(0);

        wsX.textContent = rover.x.toFixed(2);
        wsY.textContent = rover.y.toFixed(2);
        wsTheta.textContent = degrees + '\u00B0';
        wsV.textContent = rover.linear_vel;
        wsOmega.textContent = rover.angular_vel.toFixed(1);
        wsCollision.textContent = rover.is_colliding ? 'true' : 'false';

        telemetryText.textContent = 'x: ' + rover.x.toFixed(2) + ' | y: ' + rover.y.toFixed(2) + ' | heading: ' + degrees + '\u00B0 | v: ' + rover.linear_vel + ' | omega: ' + rover.angular_vel.toFixed(1);

        if (rover.is_colliding) {
            telemetryStatus.textContent = 'Warning: Collision detected!';
            telemetryStatus.style.color = '#D95319';
        } else {
            telemetryStatus.textContent = 'Status: Nominal';
            telemetryStatus.style.color = '#77AC30';
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        ctx.save();
        ctx.translate(rover.x, rover.y);
        ctx.rotate(rover.theta);

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = rover.is_colliding ? COLORS.darkRed : COLORS.blue;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#333';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(28, 0);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = COLORS.orange;
        ctx.stroke();

        ctx.restore();

    } catch (err) {
        console.error('Simulation error:', err);
    }

    requestAnimationFrame(updateSimulation);
}

async function sendControl(action) {
    try {
        await fetch('/api/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })
        });
    } catch (err) {
        console.error('Control error:', err);
    }
}

window.addEventListener('keydown', (e) => {
    const keyMap = {
        'ArrowUp': 'forward', 'w': 'forward',
        'ArrowDown': 'backward', 's': 'backward',
        'ArrowLeft': 'left', 'a': 'left',
        'ArrowRight': 'right', 'd': 'right',
        ' ': 'stop'
    };

    if (e.key in keyMap) {
        e.preventDefault();
        sendControl(keyMap[e.key]);
    }
});

updateSimulation();
