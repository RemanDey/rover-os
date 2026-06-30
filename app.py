from flask import Flask, render_template, jsonify, request
import math
import time

app = Flask(__name__)

# Global Rover State Matrix
rover_state = {
    "x": 250.0,
    "y": 250.0,
    "theta": 0.0,
    "linear_vel": 0.0,
    "angular_vel": 0.0,
    "is_colliding": False  # Flag to pass collision status to frontend
}

last_update_time = time.time()

# Environment Parameters
CANVAS_SIZE = 500
ROBOT_RADIUS = 20

@app.route('/')
def index():
    
    return render_template('index.html')

@app.route('/api/state', methods=['GET'])
def get_state():
    global last_update_time
    now = time.time()
    dt = now - last_update_time
    last_update_time = now
    
    # Calculate tentative next positions
    rover_state["theta"] += rover_state["angular_vel"] * dt
    next_x = rover_state["x"] + rover_state["linear_vel"] * math.cos(rover_state["theta"]) * dt
    next_y = rover_state["y"] + rover_state["linear_vel"] * math.sin(rover_state["theta"]) * dt
    
    # Boundary constraints considering the robot's physical size
    min_coord = ROBOT_RADIUS
    max_coord = CANVAS_SIZE - ROBOT_RADIUS
    
    # Check for collisions with walls
    if next_x <= min_coord or next_x >= max_coord or next_y <= min_coord or next_y >= max_coord:
        rover_state["is_colliding"] = True
        # Clamp coordinates to edge limits
        rover_state["x"] = max(min_coord, min(next_x, max_coord))
        rover_state["y"] = max(min_coord, min(next_y, max_coord))
        # Zero out forward velocity upon impact
        rover_state["linear_vel"] = 0.0
    else:
        rover_state["is_colliding"] = False
        rover_state["x"] = next_x
        rover_state["y"] = next_y
    
    return jsonify(rover_state)
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/control', methods=['POST'])
def control():
    data = request.json or {}
    action = data.get('action')
    
    if action == 'forward':
        rover_state['linear_vel'] = min(rover_state['linear_vel'] + 20, 150)
    elif action == 'backward':
        rover_state['linear_vel'] = max(rover_state['linear_vel'] - 20, -150)
    elif action == 'left':
        rover_state['angular_vel'] -= 0.5
    elif action == 'right':
        rover_state['angular_vel'] += 0.5
    elif action == 'stop':
        rover_state['linear_vel'] = 0.0
        rover_state['angular_vel'] = 0.0
        
    return jsonify({"status": "success", "state": rover_state})

if __name__ == '__main__':
    app.run(debug=True)