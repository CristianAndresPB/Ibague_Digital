CREATE TABLE respuesta (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  id_usuario INT NULL,
  respuesta_texto TEXT,
  fecha_respuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_respuesta_pregunta
    FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_respuesta_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;