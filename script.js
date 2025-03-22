const backendUrl = 'https://admin-back-g4cn.onrender.com';

let selectedService = '';
let selectedDate = '';
let selectedTime = '';

document.addEventListener('DOMContentLoaded', () => {
  loadServices();
});

function goToStep(step) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  if (step === 2) generateCalendar();
}

function restart() {
  selectedService = '';
  selectedDate = '';
  selectedTime = '';
  goToStep(1);
}

async function loadServices() {
  const select = document.getElementById('serviceSelect');
  select.innerHTML = '<option>Caricamento...</option>';

  try {
    const res = await fetch(`${backendUrl}/events`);
    const services = await res.json();

    select.innerHTML = '<option value="">Seleziona servizio...</option>';
    services.forEach(event => {
      const option = document.createElement('option');
      option.value = event.name;
      option.textContent = `${event.name} (${event.type === 'call' ? 'Call' : 'In sede'})`;
      select.appendChild(option);
    });

    select.addEventListener('change', e => {
      selectedService = e.target.value;
    });
  } catch (err) {
    select.innerHTML = '<option value="">Errore caricamento</option>';
  }
}

function generateCalendar() {
  const container = document.getElementById('calendarContainer');
  container.innerHTML = '';

  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day available';
    dayDiv.innerHTML = `<strong>${date.getDate()}</strong><br>${date.toLocaleDateString('it-IT', { weekday: 'short' })}`;
    dayDiv.addEventListener('click', () => {
      selectedDate = dateStr;
      document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
      dayDiv.classList.add('selected');
      loadTimeSlots();
    });

    container.appendChild(dayDiv);
  }
}

async function loadTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  container.innerHTML = '<p>Caricamento orari...</p>';

  try {
    const res = await fetch(`${backendUrl}/availability?date=${selectedDate}&time=09:00`);
    const data = await res.json();

    container.innerHTML = '';
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00'];

    slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'time-slot';
      div.textContent = slot;

      div.addEventListener('click', () => {
        selectedTime = slot;
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
      });

      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<p>Errore caricamento orari.</p>';
  }
}

async function confirmBooking() {
  const name = document.getElementById('nameInput').value;
  const email = document.getElementById('emailInput').value;
  const notes = document.getElementById('notesInput').value;

  if (!name || !email || !selectedDate || !selectedTime) {
    alert('Completa tutti i campi!');
    return;
  }

  const booking = {
    servizio: selectedService,
    giorno: selectedDate,
    ora: selectedTime,
    nome: name,
    email: email,
    motivo: notes
  };

  try {
    const res = await fetch(`${backendUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });

    if (res.ok) {
      goToStep(4);
    } else {
      alert('Errore prenotazione');
    }
  } catch (err) {
    console.error(err);
    alert('Errore connessione');
  }
}
