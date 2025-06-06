CREATE TABLE `users` (
  `uid` int(11) NOT NULL,
  `account_type` enum('CUSTOMER','STAFF') NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `address` text,
  `email` text NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `users` (`uid`, `account_type`, `first_name`, `last_name`, `gender`, `address`, `email`, `password`) VALUES
(1, 'CUSTOMER', 'Anett', 'Gosneye', 'M', '0 Anniversary Pass', 'agosneye0@oakley.com', 'mF1.X7Jt{|?S'),
(2, 'CUSTOMER', 'Mose', 'Wistance', 'M', '066 La Follette Road', 'mwistance1@sciencedaily.com', 'zK4\"2gq3I'),
(3, 'CUSTOMER', 'Clementia', 'Plume', 'F', '5099 Raven Hill', 'cplume2@merriam-webster.com', 'rG1_.8\"Yx'),
(4, 'CUSTOMER', 'Rossie', 'Blague', 'F', '35811 Russell Hill', 'rblague3@baidu.com', 'kP8!ITM9'),
(5, 'CUSTOMER', 'Sammy', 'Thurske', 'M', '72235 High Crossing Road', 'sthurske4@alibaba.com', 'gQ3{=kZ/aIk|QXk8'),
(6, 'CUSTOMER', 'Melicent', 'Gianullo', 'F', '34817 Boyd Parkway', 'mgianullo5@over-blog.com', 'eX9\"+=zK%)Vn'),
(7, 'CUSTOMER', 'Blake', 'Britch', 'F', '9 Springview Pass', 'bbritch6@biglobe.ne.jp', 'zD2%S1)pY'),
(8, 'CUSTOMER', 'Allianora', 'Izkovicz', 'F', '670 Farragut Place', 'aizkovicz7@so-net.ne.jp', 'iL1%8ym$'),
(9, 'CUSTOMER', 'Jennilee', 'Poynor', 'F', '22658 Hermina Court', 'jpoynor8@mediafire.com', 'kJ9/3g$LQrm)T'),
(10, 'CUSTOMER', 'Eydie', 'Cunradi', 'F', '24894 Caliangt Lane', 'ecunradi9@usa.gov', 'mF4<5H==l*9@+h6'),
(11, 'CUSTOMER', 'Florry', 'Hawgood', 'M', '33094 Dapin Park', 'fhawgooda@gnu.org', 'vO4&|DyAL3WB@'),
(12, 'CUSTOMER', 'Udall', 'Hockell', 'M', '38 Service Way', 'uhockellb@e-recht24.de', 'dN2<dbA4'),
(13, 'CUSTOMER', 'Ahmed', 'Yellowlea', 'F', '168 Summerview Parkway', 'ayellowleac@ft.com', 'qJ2?IT$7g4#|'),
(14, 'CUSTOMER', 'Elsi', 'Grix', 'M', '549 Menomonie Point', 'egrixd@nydailynews.com', 'yR1(cO#p'),
(15, 'CUSTOMER', 'Ynes', 'Bridgnell', 'M', '91791 Vernon Junction', 'ybridgnelle@geocities.jp', 'rI4.!<6>=i1wdaj'),
(16, 'CUSTOMER', 'Darya', 'Meyrick', 'M', '9609 Elgar Court', 'dmeyrickf@jalbum.net', 'jP1#lG{$CO#PkA'),
(17, 'CUSTOMER', 'Orv', 'Ower', 'M', '22109 Harper Alley', 'oowerg@weebly.com', 'kK7~c!W2s10lsef'),
(18, 'CUSTOMER', 'Gates', 'Petegrew', 'F', '22667 Briar Crest Trail', 'gpetegrewh@spotify.com', 'pS1$l.a\"V'),
(19, 'CUSTOMER', 'Katy', 'Jedrzejewsky', 'M', '1805 Merrick Way', 'kjedrzejewskyi@imdb.com', 'yR7&vx{/1v.X5'),
(20, 'CUSTOMER', 'Mireielle', 'Van der Spohr', 'M', '12380 Daystar Place', 'mvanderspohrj@redcross.org', 'cL0~?1(OsAOY1+bz'),
(21, 'CUSTOMER', 'Marcos', 'Flecknell', 'F', '21160 Pine View Pass', 'mflecknellk@netlog.com', 'yK8!FVc+#lp'),
(22, 'CUSTOMER', 'Audra', 'Taylorson', 'F', '2 Blue Bill Park Crossing', 'ataylorsonl@usatoday.com', 'yE8$(}gnSH'),
(23, 'CUSTOMER', 'Ab', 'Tupp', 'M', '81 Center Trail', 'atuppm@yahoo.co.jp', 'nV4)WEX\\6B'),
(24, 'CUSTOMER', 'Arnie', 'Kiely', 'F', '54 Hansons Crossing', 'akielyn@fema.gov', 'nG6(1F\"a)4obT%t'),
(25, 'CUSTOMER', 'Ethelred', 'Carme', 'F', '258 Lighthouse Bay Plaza', 'ecarmeo@archive.org', 'iL6\\d9>Ut%R)P4'),
(26, 'CUSTOMER', 'Armin', 'Curle', 'M', '38 Mcbride Alley', 'acurlep@miitbeian.gov.cn', 'gJ5\"J~x2nR0n`t'),
(27, 'STAFF', 'Kaile', 'Glazzard', 'M', '4762 Duke Plaza', 'kglazzardq@samsung.com', 'uD8$TR<>?nb'),
(28, 'CUSTOMER', 'Kenn', 'Bullivant', 'F', '7 Ryan Hill', 'kbullivantr@blog.com', 'wX6&o?H0%'),
(29, 'CUSTOMER', 'Lidia', 'Dymocke', 'F', '2 Vernon Alley', 'ldymockes@google.it', 'vV2%YVNW7JS'),
(30, 'CUSTOMER', 'Franciska', 'Cosgry', 'M', '03 Raven Hill', 'fcosgryt@scientificamerican.com', 'vG1|zDGPSFEEWC<'),
(31, 'CUSTOMER', 'Mechelle', 'Catanheira', 'M', '97403 Montana Way', 'mcatanheirau@nhs.uk', 'pK4@M#xH'),
(32, 'CUSTOMER', 'Stacey', 'Siggers', 'M', '27825 Southridge Center', 'ssiggersv@lycos.com', 'qS0~ccv.kA5'),
(33, 'CUSTOMER', 'Manda', 'Astlett', 'F', '12235 Melody Trail', 'mastlettw@foxnews.com', 'nQ4*JY\\k#p'),
(34, 'CUSTOMER', 'Andrey', 'Pardey', 'M', '58 Grayhawk Alley', 'apardeyx@example.com', 'iL3$T&vC>DU|'),
(35, 'STAFF', 'Arlie', 'Beaufoy', 'M', '549 Old Gate Court', 'abeaufoyy@odnoklassniki.ru', 'lU8?&*x#~$fze'),
(36, 'CUSTOMER', 'Shayna', 'Rosling', 'M', '729 Corry Drive', 'sroslingz@drupal.org', 'zN0@wDbLmQ'),
(37, 'CUSTOMER', 'Emyle', 'Betts', 'F', '87872 Gale Street', 'ebetts10@state.gov', 'cO9%}A.>K>q&gp'),
(38, 'CUSTOMER', 'Carolyne', 'Magenny', 'M', '0 Sauthoff Court', 'cmagenny11@elegantthemes.com', 'pD0{_I1F1)EK1'),
(39, 'CUSTOMER', 'Wylma', 'Zannuto', 'F', '11 Vermont Plaza', 'wzannuto12@biglobe.ne.jp', 'tO8,WER\\'),
(40, 'CUSTOMER', 'Ginger', 'Sanpher', 'F', '9 Randy Place', 'gsanpher13@ucsd.edu', 'kY4$&v89iY'),
(41, 'STAFF', 'Nichole', 'Flanne', 'M', '056 Shoshone Terrace', 'nflanne14@opera.com', 'vO8_+?$I>dIftQ!W'),
(42, 'CUSTOMER', 'Marie-jeanne', 'Dowse', 'F', '65 Mallard Crossing', 'mdowse15@dropbox.com', 'eZ9\"WDZJt'),
(43, 'CUSTOMER', 'Leland', 'Hellings', 'M', '0 North Alley', 'lhellings16@sakura.ne.jp', 'rE2(/t/.f'),
(44, 'CUSTOMER', 'Rachael', 'Wardale', 'M', '1 Nova Court', 'rwardale17@discovery.com', 'qS6\"v9,ILc(wFm'),
(45, 'CUSTOMER', 'Muffin', 'Lidgate', 'M', '2 Hansons Park', 'mlidgate18@1688.com', 'rJ7}$WBw1U'),
(46, 'CUSTOMER', 'Merla', 'Soame', 'F', '3562 Acker Parkway', 'msoame19@cmu.edu', 'rQ1$IKQtE`'),
(47, 'CUSTOMER', 'Bev', 'Scoffins', 'M', '74 Saint Paul Street', 'bscoffins1a@wired.com', 'aC8%Tu4NA_'),
(48, 'CUSTOMER', 'Belia', 'Allridge', 'F', '313 La Follette Center', 'ballridge1b@github.com', 'dP2+Q4/td2V_'),
(49, 'CUSTOMER', 'Talbert', 'Wilding', 'M', '83 6th Parkway', 'twilding1c@exblog.jp', 'jS6$n/?o`@.XxLY'),
(50, 'CUSTOMER', 'Marianna', 'Grimestone', 'F', '98564 Garrison Court', 'mgrimestone1d@plala.or.jp', 'gB1=/\\*,rQjF\W');

ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`);

ALTER TABLE `users`
  MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
COMMIT;


CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    description TEXT,
    available BOOLEAN,
    qty INT
);

INSERT INTO products (id, name, price, description, available, qty) VALUES
(1, 'Arduino UNO R4 Minima', 19.99, 'A versatile microcontroller board with built-in USB connectivity.', TRUE, 5),
(2, 'PIR Motion Sensor', 12.99, 'Detects human presence through infrared radiation changes.', TRUE, 2),
(3, 'DHT22 Temperature Sensor', 9.99, 'Digital humidity and temperature sensor with high accuracy.', TRUE, 6),
(4, 'Analog Ambient Light Sensor', 7.99, 'Measures light intensity with analog output.', FALSE, 6),
(5, 'Raspberry Pi 5 16GB', 212.50, 'High-performance single-board computer with 16GB RAM.', TRUE, 6),
(6, 'ESP32 Development Board', 15.99, 'Wi-Fi and Bluetooth enabled microcontroller with dual-core processor.', TRUE, 6),
(7, 'OLED Display 0.96\"', 8.50, 'Small monochrome OLED display with I2C interface.', TRUE, 42),
(8, 'Breadboard 400 Points', 5.99, 'Reusable solderless breadboard for prototyping circuits.', TRUE, 75),
(9, 'Jumper Wires Pack', 6.99, 'Set of 120 male-to-male, male-to-female, and female-to-female jumper wires.', TRUE, 0),
(10, '5V Relay Module', 4.99, 'Single channel relay module for controlling high voltage devices.', FALSE, 9),
(11, 'Micro Servo Motor', 4.99, 'Small servo motor perfect for robotics projects with 180-degree rotation.', TRUE, 7),
(12, 'HC-SR04 Ultrasonic Sensor', 3.99, 'Ultrasonic distance measurement sensor with 2cm-400cm range.', TRUE, 2),
(13, 'Joystick Module', 6.50, 'Analog joystick with push button for game controllers and robotics.', TRUE, 5),
(14, 'RGB LED Strip', 14.99, '1 meter addressable RGB LED strip with 60 LEDs per meter.', FALSE, 51),
(15, 'IR Remote Control Kit', 5.50, 'Infrared remote control with receiver module for wireless projects.', TRUE, 3),
(16, 'Rotary Encoder', 3.50, 'Digital rotary encoder with push button for precise input control.', TRUE, 1),
(17, '4-Digit 7-Segment Display', 7.25, 'Common cathode 4-digit display with colon for time projects.', TRUE, 52),
(18, 'Tilt Switch Sensor', 2.99, 'Simple tilt-activated switch for orientation detection.', TRUE, 5),
(19, 'Capacitive Touch Sensor', 4.25, 'Touch-sensitive module that works through non-conductive materials.', TRUE, 11),
(20, 'DC Motor with Wheel', 8.99, 'TT gear motor with rubber wheel for robotics projects.', TRUE, 2);
