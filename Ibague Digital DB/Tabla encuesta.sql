CREATE TABLE encuesta (
  id_encuesta INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  fecha_creacion DATE NOT NULL,
  id_usuario INT NULL,
  CONSTRAINT fk_encuesta_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;
