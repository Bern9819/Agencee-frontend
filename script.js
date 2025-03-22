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

async function loadTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  const collaboratorSelect = document.getElementById('collaboratorSelect');

  container.innerHTML = 'Caricamento...';
  collaboratorSelect.innerHTML = '<option>Caricamento...</option>';

  try {
    const response = await fetch(`${backendUrl}/availability?date=${selectedDate}`);
    const data = await response.json();

    // Time slots
    container.innerHTML = '';
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00']; // Example slots
    slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'time-slot';
      div.innerText = slot;
      div.addEventListener('click', () => {
        selectedTime = slot;
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        updateCollaborators(data.availableCollaborators);
      });
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Errore caricamento slot:', error);
    container.innerHTML = '<p>Errore caricamento orari</p>';
  }
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
