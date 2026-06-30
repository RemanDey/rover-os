# RoverOS

A lightweight, real-time 2D **TurtleBot simulation** built using a **Python Flask** backend and an **HTML5 Canvas** frontend. This simulator implements fundamental differential drive kinematics on the server side and streams physics frames seamlessly to the browser, offering a lightweight alternative to heavy ROS/Gazebo environments for educational or testing purposes.

---

## Features

- **Kinematics Engine**: Real-time positional ($x, y$) and heading ($\theta$) calculations processed on the server using continuous time differentials ($dt$).
- **Responsive Teleoperation**: Smooth keyboard interactions using standard Arrow keys or `WASD` mappings, with an Emergency Stop toggle (`Spacebar`).
- **Telemetry UI**: Dynamic dashboard showcasing live coordinates and angular orientation calculated straight from the robot's state vector.
- **Zero Heavy Dependencies**: Completely self-contained framework bypassing complex ROS stack installations.

---

## 📂 Project Structure

```text
rover-os/
│
├── app.py               # Flask Application & Kinematics Engine
└── templates/
    └── index.html       # HTML5 Canvas Rendering UI & Input Handler
