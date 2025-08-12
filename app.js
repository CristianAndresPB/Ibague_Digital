/* Multi-step survey SPA */

(function(){
  // Elements
  const screens = {
    welcome: document.getElementById('screen-welcome'),
    survey: document.getElementById('screen-survey'),
    results: document.getElementById('screen-results')
  };
  const startButtons = [document.getElementById('btn-start'), document.getElementById('start-survey')];
  const loadDraftBtn = document.getElementById('load-draft');
  const surveyForm = document.getElementById('survey-form');
  const steps = Array.from(document.querySelectorAll('.step'));
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const saveDraftBtn = document.getElementById('save-draft-btn');
  const progressBar = document.getElementById('progress-bar');
  const stepNumber = document.getElementById('step-number');
  const exportJsonBtn = document.getElementById('export-json');
  const backToStartBtn = document.getElementById('back-to-start');

  let currentStep = 0; // index
  const totalSteps = steps.length;

  // Sample aggregated data (demo) - will be updated with submissions saved in localStorage
  const SAMPLE_KEY = 'ibague_aggregated';
  let aggregated = initializeAggregated();

  function initializeAggregated(){
    const existing = localStorage.getItem(SAMPLE_KEY);
    if(existing) return JSON.parse(existing);
    // initial sample counts
    const sample = {
      hours: {'0-1': 20, '1-3': 80, '3-6': 120, '6+': 60},
      device: {'smartphone': 180, 'pc': 50, 'tablet': 20, 'multiple': 30},
      social: {'facebook': 80,'instagram': 100,'tiktok': 90,'youtube':60,'twitter':30,'none':10},
      newsfreq: {'daily':120,'weekly':100,'rarely':50,'never':10},
      format: {'text':140,'audio':30,'video':110}
    };
    localStorage.setItem(SAMPLE_KEY, JSON.stringify(sample));
    return sample;
  }

  function showScreen(name){
    Object.keys(screens).forEach(k=>{
      const el = screens[k];
      if(k===name){
        el.classList.add('active');
        el.setAttribute('aria-hidden','false');
      } else {
        el.classList.remove('active');
        el.setAttribute('aria-hidden','true');
      }
    });
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // Start buttons
  startButtons.forEach(btn => btn && btn.addEventListener('click', ()=> showScreen('survey')));
  document.getElementById('btn-start')?.addEventListener('click', ()=> {});

  // Navigation functions
  function updateStepUI(){
    steps.forEach((s, idx)=>{
      if(idx===currentStep){
        s.hidden = false;
      } else s.hidden = true;
    });
    prevBtn.disabled = currentStep===0;
    nextBtn.hidden = currentStep===totalSteps-1;
    submitBtn.hidden = currentStep!==totalSteps-1;
    stepNumber.textContent = (currentStep+1);
    const pct = Math.round(((currentStep)/ (totalSteps-1)) * 100);
    progressBar.style.width = pct + '%';
  }

  nextBtn.addEventListener('click', ()=>{
    // validate current step required fields
    const inputs = steps[currentStep].querySelectorAll('select, input');
    for(const el of inputs){
      if(el.required && !el.value){
        el.focus();
        el.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)';
        setTimeout(()=> el.style.boxShadow = '', 1200);
        return;
      }
    }
    if(currentStep < totalSteps -1) currentStep++;
    updateStepUI();
  });

  prevBtn.addEventListener('click', ()=>{
    if(currentStep > 0) currentStep--;
    updateStepUI();
  });

  // Save draft
  saveDraftBtn.addEventListener('click', ()=>{
    const data = new FormData(surveyForm);
    const obj = Object.fromEntries(data.entries());
    localStorage.setItem('ibague_draft', JSON.stringify(obj));
    alert('Borrador guardado localmente');
  });

  loadDraftBtn.addEventListener('click', ()=>{
    const draft = localStorage.getItem('ibague_draft');
    if(!draft){ alert('No hay borrador guardado'); return; }
    const parsed = JSON.parse(draft);
    Object.keys(parsed).forEach(k=>{
      const el = surveyForm.elements[k];
      if(!el) return;
      el.value = parsed[k];
    });
    alert('Borrador cargado');
  });

  // Submit
  surveyForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(surveyForm);
    const obj = Object.fromEntries(data.entries());
    // Merge into aggregated counts
    for(const key of ['hours','device','social','newsfreq','format']){
      const val = obj[key];
      if(!val) continue;
      if(!aggregated[key]) aggregated[key] = {};
      aggregated[key][val] = (aggregated[key][val] || 0) + 1;
    }
    localStorage.setItem(SAMPLE_KEY, JSON.stringify(aggregated));
    // Save last submission separately
    localStorage.setItem('ibague_last_submission', JSON.stringify(obj));
    showResults();
  });

  // Show results screen and render charts
  function showResults(){
    showScreen('results');
    renderCharts();
  }

  function renderCharts(){
    // reload aggregated (in case)
    aggregated = JSON.parse(localStorage.getItem(SAMPLE_KEY));

    // Chart: hours
    const ctxHours = document.getElementById('chart-hours').getContext('2d');
    const hoursLabels = Object.keys(aggregated.hours);
    const hoursData = hoursLabels.map(k=>aggregated.hours[k]);
    new Chart(ctxHours, {
      type: 'bar',
      data: { labels: hoursLabels, datasets: [{ label: 'Respuestas', data: hoursData }] },
      options: { responsive:true, plugins:{legend:{display:false}} }
    });

    // device
    const ctxDevice = document.getElementById('chart-device').getContext('2d');
    const deviceLabels = Object.keys(aggregated.device);
    const deviceData = deviceLabels.map(k=>aggregated.device[k]);
    new Chart(ctxDevice, {
      type: 'doughnut',
      data: { labels: deviceLabels, datasets: [{ label:'Dispositivos', data: deviceData }] },
      options: { responsive:true }
    });

    // social
    const ctxSocial = document.getElementById('chart-social').getContext('2d');
    const socialLabels = Object.keys(aggregated.social);
    const socialData = socialLabels.map(k=>aggregated.social[k]);
    new Chart(ctxSocial, {
      type: 'bar',
      data: { labels: socialLabels, datasets: [{ label:'Redes', data: socialData }] },
      options: { responsive:true, plugins:{legend:{display:false}} }
    });

    // format
    const ctxFormat = document.getElementById('chart-format').getContext('2d');
    const formatLabels = Object.keys(aggregated.format);
    const formatData = formatLabels.map(k=>aggregated.format[k]);
    new Chart(ctxFormat, {
      type: 'pie',
      data: { labels: formatLabels, datasets: [{ label:'Formato', data: formatData }] },
      options: { responsive:true }
    });
  }

  // Export data
  exportJsonBtn.addEventListener('click', ()=>{
    const data = JSON.parse(localStorage.getItem(SAMPLE_KEY) || '{}');
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ibague_aggregated.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Back to start
  backToStartBtn.addEventListener('click', ()=>{
    showScreen('welcome');
  });

  // Quick nav buttons
  document.getElementById('btn-start').addEventListener('click', ()=> showScreen('survey'));

  // On load: if last submission exists, show results quick link
  const last = localStorage.getItem('ibague_last_submission');
  if(last){
    // add small notice? For simplicity, show results button in header - handled later
  }

  // Initialize UI state
  updateStepUI();
  showScreen('welcome');

  function mostrarPantalla(pantallaId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(pantallaId).classList.add("active");

    // Mostrar/ocultar iconos según la pantalla
    const infoInicio = document.getElementById("info-inicio");
    if (infoInicio) {
        if (pantallaId === "screen-welcome") {
            infoInicio.style.display = "flex";
        } else {
            infoInicio.style.display = "none";
        }
    }
}
})();
