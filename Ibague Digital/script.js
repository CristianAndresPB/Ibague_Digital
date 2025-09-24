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

    finishBtn.addEventListener('click', () => {
        surveyPage.classList.add('hidden');
        homePage.classList.remove('hidden');
        alert('¡Encuesta enviada con éxito!');
    });
});