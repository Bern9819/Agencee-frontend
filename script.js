let selectedService = '';
let selectedDate = '';
let selectedTime = '';
let currentMonthOffset = 0;

function goToStep(step) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  if (step === 2) generateCalendar();
}

function prevMonth() {
  currentMonthOffset--;
  generateCalendar();
}

function nextMonth() {
  currentMonthOffset++;
  generateCalendar();
}

function generateCalendar() {
  const container = document.getElementById('calendarContainer');
  const label = document.getElementById('monthYearLabel');
  container.innerHTML = '';

  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  label.innerText = `${currentDate.toLocaleString('it-IT', { month: 'long' })} ${year}`;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];

    const div = document.createElement('div');
    div.className = 'calendar-day available';
    div.innerHTML = `<strong>${day}</strong><br>${date.toLocaleDateString('it-IT', { weekday: 'short' })}`;

    div.addEventListener('click', () => {
      selectedDate = dateStr;
      document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      loadTimeSlots(); // aggiornato
    });

    container.appendChild(div);
  }
}

async function loadTimeSlots() {
  const slotsList = document.getElementById('slots');
  slotsList.innerHTML = '<p>Caricamento orari disponibili...</p>';

  try {
    const res = await fetch(`${backendUrl}/availability/all?date=${selectedDate}`);
    const data = await res.json();

    slotsList.innerHTML = '';

    const availableSlots = Object.keys(data); // formato: { '09:00': [...], '10:00': [...] }

    if (availableSlots.length === 0) {
      slotsList.innerHTML = '<p>Nessun orario disponibile</p>';
      return;
    }

    availableSlots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'slot';
      div.textContent = slot;

      div.addEventListener('click', () => {
        selectedTime = slot;
        document.querySelectorAll('.slot').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');

        const collaborators = data[slot]; // array di nomi
        loadCollaborators(collaborators);
      });

      slotsList.appendChild(div);
    });

  } catch (error) {
    console.error('Errore caricamento disponibilità:', error);
    slotsList.innerHTML = '<p>Errore nel caricamento</p>';
  }
}

function loadCollaborators(availableNames) {
  const collaboratorSelect = document.getElementById('collaboratorSelect');
  collaboratorSelect.innerHTML = '<option value="">Seleziona collaboratore...</option>';

  availableNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    collaboratorSelect.appendChild(option);
  });
}
