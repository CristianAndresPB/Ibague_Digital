document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const startSurveyBtn = document.getElementById('startSurveyBtn');
    const finishBtn = document.getElementById('finishBtn');

    const homePage = document.getElementById('homePage');
    const formPage = document.getElementById('formPage');
    const surveyPage = document.getElementById('surveyPage');

    startBtn.addEventListener('click', () => {
        homePage.classList.add('hidden');
        formPage.classList.remove('hidden');
    });

    startSurveyBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        if (name && age && gender) {
            formPage.classList.add('hidden');
            surveyPage.classList.remove('hidden');
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    finishBtn.addEventListener('click', () => {
        const answers = {
            q1: document.getElementById('q1').value,
            q2: document.getElementById('q2').value,
            q3: document.getElementById('q3').value,
            q4: document.getElementById('q4').value,
            q5: document.getElementById('q5').value,
        };

        if (Object.values(answers).every(answer => answer)) {
            alert('Gracias por participar en la encuesta.');
            // Aquí se puede agregar la lógica para enviar las respuestas a un servidor
            // o procesarlas según sea necesario.
            surveyPage.classList.add('hidden');
            homePage.classList.remove('hidden');
        } else {
            alert('Por favor, responda todas las preguntas.');
        }
    });
});