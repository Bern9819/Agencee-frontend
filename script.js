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
      loadTimeSlots();
    });

    container.appendChild(div);
  }
}

async function generateSlots() {
  const slotsList = document.getElementById('slots');
  slotsList.innerHTML = '<p>Caricamento orari disponibili...</p>';

  try {
    const res = await fetch(`${backendUrl}/availability?date=${selectedDate}`);
    const data = await res.json();

    slotsList.innerHTML = '';

    if (!data.availableCollaborators.length) {
      slotsList.innerHTML = '<p>Nessun collaboratore disponibile in questa data</p>';
      return;
    }

    data.slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'slot';
      div.textContent = slot;

      div.addEventListener('click', () => {
        selectedSlot = slot;
        document.querySelectorAll('.slot').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');

        loadCollaborators(data.availableCollaborators);
      });

      slotsList.appendChild(div);
    });
  } catch (error) {
    console.error('Errore caricamento disponibilità:', error);
    slotsList.innerHTML = '<p>Errore caricamento orari</p>';
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

function updateCollaborators(collaborators = []) {
  const collaboratorSelect = document.getElementById('collaboratorSelect');
  collaboratorSelect.innerHTML = '';

  if (collaborators.length === 0) {
    collaboratorSelect.innerHTML = '<option value="">Nessun collaboratore disponibile</option>';
  } else {
    collaboratorSelect.innerHTML = '<option value="">Seleziona collaboratore...</option>';
    collaborators.forEach(c => {
      const option = document.createElement('option');
      option.value = c.name;
      option.text = c.name;
      collaboratorSelect.appendChild(option);
    });
  }
}
