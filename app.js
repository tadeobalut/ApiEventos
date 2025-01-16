// Función para obtener eventos desde la API
async function fetchEvents(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al obtener los eventos: ${response.statusText}`);
    }

    const data = await response.json();

    const eventsContainer = document.getElementById('events');
    eventsContainer.innerHTML = '';

    if (data._embedded && data._embedded.events && data._embedded.events.length > 0) {
      let events = data._embedded.events;

      events.forEach(event => {
        const imageUrl = getImageUrl(event);

        displayEvent(event, imageUrl);
      });
    } else {
      eventsContainer.innerHTML = '<p>No se encontraron eventos.</p>';
    }
  } catch (error) {
    console.error('Error al obtener los eventos:', error);

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      alert('Hubo un error al obtener los eventos. Intenta de nuevo más tarde.');
    }
  }
}

// Función para obtener todos los eventos de Marbella
function getAllEvents() {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=50&city=Marbella&locale=*`;

  fetchEvents(url);
}

// Función para buscar eventos
function searchEvents() {
  const keyword = document.getElementById('artist').value.trim();

  if (keyword === '') {
    alert('Por favor ingresa un término de búsqueda.');
    return;
  }

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=60&keyword=${keyword}&city=Marbella&locale=*`;
  fetchEvents(url);
}

// Función para obtener la imagen del evento
function getImageUrl(event) {
  if (event.images && event.images.length > 0) {
    return event.images[0].url;
  }
}

// Función para mostrar un evento en la página
function displayEvent(event, imageUrl) {
  const eventsContainer = document.getElementById('events');

  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card');
  eventCard.innerHTML = `
    <h2>${event.name}</h2>
    <p>${event.dates.start.localDate}</p>
    <p>${event._embedded.venues[0].name}, ${event._embedded.venues[0].city.name}</p>
    <img src="${imageUrl}" alt="${event.name}" class="event-image"/>
    <a href="${event.url}" target="_blank">Más información</a>
  `;

  eventsContainer.appendChild(eventCard);
}

getAllEvents();

document.getElementById('search-button').addEventListener('click', searchEvents);
