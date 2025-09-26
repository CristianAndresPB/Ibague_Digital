CREATE TABLE opciones (
  id_opcion INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto_opcion VARCHAR(255) NOT NULL,
  CONSTRAINT fk_opciones_pregunta
    FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;