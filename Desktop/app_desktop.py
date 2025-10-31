import tkinter as tk
from tkinter import messagebox
import requests

def enviar_encuesta():
    data = {
        "nombre": entry_nombre.get(),
        "edad": entry_edad.get(),
        "red_social": entry_red.get()
    }
    response = requests.post("http://127.0.0.1:5000/encuestas", json=data)
    if response.status_code == 201:
        messagebox.showinfo("Éxito", "Encuesta enviada correctamente")
    else:
        messagebox.showerror("Error", "No se pudo enviar la encuesta")

root = tk.Tk()
root.title("Ibagué Digital (Desktop)")
tk.Label(root, text="Nombre").pack()
entry_nombre = tk.Entry(root); entry_nombre.pack()
tk.Label(root, text="Edad").pack()
entry_edad = tk.Entry(root); entry_edad.pack()
tk.Label(root, text="Red Social favorita").pack()
entry_red = tk.Entry(root); entry_red.pack()
tk.Button(root, text="Enviar", command=enviar_encuesta).pack(pady=10)
root.mainloop()
