document.addEventListener('DOMContentLoaded', () => {
    const homePage = document.getElementById('homePage');
    const formPage = document.getElementById('formPage');
    const surveyPage = document.getElementById('surveyPage');
    const startBtn = document.getElementById('startBtn');
    const startSurveyBtn = document.getElementById('startSurveyBtn');
    const finishBtn = document.getElementById('finishBtn');

    startBtn.addEventListener('click', () => {
        homePage.classList.add('hidden');
        formPage.classList.remove('hidden');
    });

    startSurveyBtn.addEventListener('click', () => {
        formPage.classList.add('hidden');
        surveyPage.classList.remove('hidden');
    });

    finishBtn.addEventListener('click', function() {
        // Obtener datos del formulario
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const q1 = document.getElementById('q1').value;
        const q2 = document.getElementById('q2').value;
        const q3 = document.getElementById('q3').value;
        const q4 = document.getElementById('q4').value;
        const q5 = document.getElementById('q5').value;

        // Validar que todos los campos estén diligenciados
        if (!name || !age || !gender || !q1 || !q2 || !q3 || !q4 || !q5) {
            alert('Por favor completa todos los campos.');
            return;
        }

        // Guardar en localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({ name, age, gender, q1, q2, q3, q4, q5 });
        localStorage.setItem('users', JSON.stringify(users));

        alert('¡Encuesta enviada correctamente!');
        //  redirigir o limpiar el formulario aquí "Opcional"
    });
});