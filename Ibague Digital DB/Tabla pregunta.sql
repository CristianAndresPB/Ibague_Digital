CREATE TABLE pregunta (
  id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  texto_pregunta TEXT NOT NULL,
  id_encuesta INT NOT NULL,
  CONSTRAINT fk_pregunta_encuesta
    FOREIGN KEY (id_encuesta) REFERENCES encuesta(id_encuesta)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;