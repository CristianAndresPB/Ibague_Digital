INSERT INTO encuesta (titulo, fecha_creacion, id_usuario)
VALUES ('Encuesta Hábitos Digitales - Demo', CURDATE(), NULL);

SET @encuesta_id = LAST_INSERT_ID();

-- Pregunta 1
INSERT INTO pregunta (texto_pregunta, id_encuesta)
VALUES ('¿Cuántas horas al día, en promedio, usas Internet?', @encuesta_id);
SET @p1 = LAST_INSERT_ID();

INSERT INTO opciones (id_pregunta, texto_opcion) VALUES
(@p1, 'Menos de 1 hora'),
(@p1, '1 a 3 horas'),
(@p1, '3 a 6 horas'),
(@p1, 'Más de 6 horas');

-- Pregunta 2
INSERT INTO pregunta (texto_pregunta, id_encuesta)
VALUES ('¿Qué dispositivo usas con mayor frecuencia?', @encuesta_id);
SET @p2 = LAST_INSERT_ID();

INSERT INTO opciones (id_pregunta, texto_opcion) VALUES
(@p2, 'Smartphone'),
(@p2, 'Computadora / Laptop'),
(@p2, 'Tablet'),
(@p2, 'Varios');

-- Pregunta 3
INSERT INTO pregunta (texto_pregunta, id_encuesta)
VALUES ('¿Cuál es tu red social más utilizada?', @encuesta_id);
SET @p3 = LAST_INSERT_ID();

INSERT INTO opciones (id_pregunta, texto_opcion) VALUES
(@p3, 'Facebook'),
(@p3, 'Instagram'),
(@p3, 'TikTok'),
(@p3, 'YouTube'),
(@p3, 'Twitter'),
(@p3, 'No uso');

-- Pregunta 4
INSERT INTO pregunta (texto_pregunta, id_encuesta)
VALUES ('¿Con qué frecuencia ves noticias en medios digitales?', @encuesta_id);
SET @p4 = LAST_INSERT_ID();

INSERT INTO opciones (id_pregunta, texto_opcion) VALUES
(@p4, 'Diariamente'),
(@p4, 'Semanalmente'),
(@p4, 'Rara vez');

-- Pregunta 5
INSERT INTO pregunta (texto_pregunta, id_encuesta)
VALUES ('¿Prefieres consumir información en formato?', @encuesta_id);
SET @p5 = LAST_INSERT_ID();

INSERT INTO opciones (id_pregunta, texto_opcion) VALUES
(@p5, 'Texto'),
(@p5, 'Audio'),
(@p5, 'Video');