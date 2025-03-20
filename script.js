const backendUrl = 'https://admin-back-g4cn.onrender.com';

let selectedDate = '';
let selectedTime = '';
let currentWeekOffset = 0;

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page${page}`).classList.add('active');
}

function nextPage(pageNumber) {
  if (pageNumber === 2 && !document.getElementById('serviceSelect').value) {
    alert('Seleziona un servizio');
    return;
  }

  if (pageNumber === 3) {
    const collaborator = document.getElementById('collaboratorSelect').value;
    if (!selectedDate || !selectedTime || !collaborator) {
      alert('Completa la scelta di data/orario e collaboratore');
      return;
    }

    document.getElementById('summaryService').textContent = document.getElementById('serviceSelect').value;
    document.getElementById('summaryDate').textContent = selectedDate;
    document.getElementById('summaryTime').textContent = selectedTime;
    document.getElementById('summaryCollaborator').textContent = collaborator;
  }

  showPage(pageNumber);
}

async function loadServices() {
  const select = document.getElementById('serviceSelect');
  try {
    const res = await fetch(`${backendUrl}/events`);
    const services = await res.json();

    select.innerHTML = '<option value="">Seleziona...</option>';
    services.forEach(event => {
      const opt = document.createElement('option');
      opt.value = event.name;
      opt.text = `${event.name} (${event.type === 'call' ? 'Call' : 'In sede'})`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error('Errore caricamento servizi', error);
    select.innerHTML = '<option value="">Errore</option>';
  }
}

function generateDays() {
  const daysContainer = document.getElementById('calendarDays');
  daysContainer.innerHTML = '';

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + currentWeekOffset * 7);

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.innerHTML = `<div>${daysOfWeek[i]}</div><div>${date.getDate()}</div>`;

    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    dayDiv.onclick = () => {
      selectedDate = dateString;
      document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
      dayDiv.classList.add('selected');
      generateSlots();
    };

    daysContainer.appendChild(dayDiv);
  }
}

async function generateSlots() {
  const slotsContainer = document.getElementById('slotsList');
  slotsContainer.innerHTML = '';

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];

  for (let time of times) {
    const res = await fetch(`${backendUrl}/availability?date=${selectedDate}&time=${time}`);
    const data = await res.json();

    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-item';

    if (!data.availableCollaborators || data.availableCollaborators.length === 0) {
      slotDiv.classList.add('disabled');
      slotDiv.textContent = `${time} - Non disponibile`;
    } else {
      slotDiv.textContent = `${time}`;
      slotDiv.onclick = () => {
        selectedTime = time;
        document.querySelectorAll('.slot-item').forEach(el => el.classList.remove('selected'));
        slotDiv.classList.add('selected');
        updateAvailableCollaborators();
      };
    }

    slotsContainer.appendChild(slotDiv);
  }
}

async function updateAvailableCollaborators() {
  const collabSelect = document.getElementById('collaboratorSelect');
  collabSelect.innerHTML = '<option>Caricamento...</option>';

  if (!selectedDate || !selectedTime) return;

  try {
    const res = await fetch(`${backendUrl}/availability?date=${selectedDate}&time=${selectedTime}`);
    const data = await res.json();

    if (!data.availableCollaborators || data.availableCollaborators.length === 0) {
      collabSelect.innerHTML = '<option>Nessun collaboratore disponibile</option>';
    } else {
      collabSelect.innerHTML = '<option>Seleziona...</option>';
      data.availableCollaborators.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.text = name;
        collabSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Errore collaboratori', err);
    collabSelect.innerHTML = '<option>Errore caricamento</option>';
  }
}

async function sendBooking() {
  const name = document.getElementById('nameInput').value;
  const email = document.getElementById('emailInput').value;
  const reason = document.getElementById('reasonInput').value;

  if (!name || !email || !reason) {
    alert('Completa tutti i campi!');
    return;
  }

  const booking = {
    servizio: document.getElementById('serviceSelect').value,
    giorno: selectedDate,
    ora: selectedTime,
    collaboratore: document.getElementById('collaboratorSelect').value,
    nome: name,
    email: email,
    motivo: reason
  };

  try {
    const res = await fetch(`${backendUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });

    if (res.ok) {
      showPage(4);
    } else {
      alert('Errore nella prenotazione');
    }

  } catch (err) {
    console.error('Errore invio prenotazione', err);
  }
}

function nextWeek() {
  currentWeekOffset++;
  generateDays();
}

function prevWeek() {
  currentWeekOffset--;
  generateDays();
}

// Init
loadServices();
generateDays();
