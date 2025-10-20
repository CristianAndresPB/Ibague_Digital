import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

export default function App() {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [redSocial, setRedSocial] = useState('');

  const enviarEncuesta = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/encuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, edad, red_social: redSocial })
      });
      if (response.ok) Alert.alert('Éxito', 'Encuesta enviada');
      else Alert.alert('Error', 'No se pudo enviar');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Nombre</Text>
      <TextInput value={nombre} onChangeText={setNombre} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Edad</Text>
      <TextInput value={edad} onChangeText={setEdad} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Red Social favorita</Text>
      <TextInput value={redSocial} onChangeText={setRedSocial} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Enviar" onPress={enviarEncuesta} />
    </View>
  );
}
