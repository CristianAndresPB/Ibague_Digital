from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# Modelo de encuesta
class Encuesta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    edad = db.Column(db.Integer)
    genero = db.Column(db.String(20))
    q1 = db.Column(db.String(50))
    q2 = db.Column(db.String(50))
    q3 = db.Column(db.String(50))
    q4 = db.Column(db.String(50))
    q5 = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'edad': self.edad,
            'genero': self.genero,
            'q1': self.q1,
            'q2': self.q2,
            'q3': self.q3,
            'q4': self.q4,
            'q5': self.q5
        }

with app.app_context():
    db.create_all()

@app.route('/encuestas', methods=['POST'])
def guardar_encuesta():
    data = request.json
    nueva = Encuesta(
        nombre=data['nombre'],
        edad=data['edad'],
        genero=data['genero'],
        q1=data['q1'],
        q2=data['q2'],
        q3=data['q3'],
        q4=data['q4'],
        q5=data['q5']
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify({'message': 'Encuesta guardada correctamente'})

@app.route('/encuestas', methods=['GET'])
def listar_encuestas():
    encuestas = Encuesta.query.all()
    return jsonify([e.to_dict() for e in encuestas])

if __name__ == '__main__':
    app.run(debug=True)
