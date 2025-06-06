-- Create the table
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    description TEXT,
    available BOOLEAN,
    qty INT NOT NULL
);

-- Insert data into the table
INSERT INTO products (id, name, price, description, available, qty) VALUES
(1, 'Arduino UNO R4 Minima', 19.99, 'A versatile microcontroller board with built-in USB connectivity.', TRUE, 12),
(2, 'PIR Motion Sensor', 12.99, 'Detects human presence through infrared radiation changes.', TRUE, 1),
(3, 'DHT22 Temperature Sensor', 9.99, 'Digital humidity and temperature sensor with high accuracy.', TRUE, 23),
(4, 'Analog Ambient Light Sensor', 7.99, 'Measures light intensity with analog output.', FALSE, 4),
(5, 'Raspberry Pi 5 16GB', 212.50, 'High-performance single-board computer with 16GB RAM.', TRUE, 5),
(6, 'ESP32 Development Board', 15.99, 'Wi-Fi and Bluetooth enabled microcontroller with dual-core processor.', TRUE, 3),
(7, 'OLED Display 0.96\"', 8.50, 'Small monochrome OLED display with I2C interface.', TRUE, 6),
(8, 'Breadboard 400 Points', 5.99, 'Reusable solderless breadboard for prototyping circuits.', TRUE, 2),
(9, 'Jumper Wires Pack', 6.99, 'Set of 120 male-to-male, male-to-female, and female-to-female jumper wires.', TRUE, 5),
(10, '5V Relay Module', 4.99, 'Single channel relay module for controlling high voltage devices.', FALSE, 6),
(11, 'Micro Servo Motor', 4.99, 'Small servo motor perfect for robotics projects with 180-degree rotation.', TRUE, 9),
(12, 'HC-SR04 Ultrasonic Sensor', 3.99, 'Ultrasonic distance measurement sensor with 2cm-400cm range.', TRUE, 7),
(13, 'Joystick Module', 6.50, 'Analog joystick with push button for game controllers and robotics.', TRUE, 9),
(14, 'RGB LED Strip', 14.99, '1 meter addressable RGB LED strip with 60 LEDs per meter.', FALSE, 6),
(15, 'IR Remote Control Kit', 5.50, 'Infrared remote control with receiver module for wireless projects.', TRUE, 4),
(16, 'Rotary Encoder', 3.50, 'Digital rotary encoder with push button for precise input control.', TRUE, 12),
(17, '4-Digit 7-Segment Display', 7.25, 'Common cathode 4-digit display with colon for time projects.', TRUE, 14),
(18, 'Tilt Switch Sensor', 2.99, 'Simple tilt-activated switch for orientation detection.', TRUE, 23),
(19, 'Capacitive Touch Sensor', 4.25, 'Touch-sensitive module that works through non-conductive materials.', TRUE, 5),
(20, 'DC Motor with Wheel', 8.99, 'TT gear motor with rubber wheel for robotics projects.', TRUE, 2);