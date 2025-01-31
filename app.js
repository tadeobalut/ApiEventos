// Variable global para almacenar el controlador de cancelación
let controller;

// Función asíncrona para obtener eventos desde la API con cancelación de solicitudes
async function fetchEvents(url) {
  try {
    // Si hay una solicitud en curso, se cancela antes de hacer una nueva
    if (controller) {
      controller.abort();
    }

    // Creamos un nuevo AbortController para la nueva solicitud
    controller = new AbortController();
    const signal = controller.signal;

    // Mensaje de carga
    const eventsContainer = document.getElementById("events");
    eventsContainer.innerHTML = "<p>Buscando eventos...</p>";

    // Realizamos la solicitud
    const response = await fetch(url, { signal });

    // Verificamos la respuesta
    if (!response.ok) {
      throw new Error(`Error al obtener los eventos: ${response.statusText}`);
    }

    const data = await response.json();
    eventsContainer.innerHTML = "";

    if (data._embedded && data._embedded.events && data._embedded.events.length > 0) {
      let events = data._embedded.events;

      // Filtra eventos según el término de búsqueda
      const keyword = document.getElementById("artist").value.trim().toLowerCase();
      if (keyword) {
        events = events.filter(event => event.name.toLowerCase().startsWith(keyword));
      }

      // Muestra eventos en pantalla
      if (events.length > 0) {
        events.forEach(event => {
          const imageUrl = getImageUrl(event);
          displayEvent(event, imageUrl);
        });
      } else {
        eventsContainer.innerHTML = "<p>No se encontraron artistas que coincidan con la búsqueda.</p>";
      }
    } else {
      eventsContainer.innerHTML = "<p>No se encontraron eventos.</p>";
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Solicitud cancelada");
    } else {
      console.error("Error al obtener los eventos:", error);
      eventsContainer.innerHTML = "<p>Error al obtener eventos.</p>";
    }
  }
}

// Búsqueda en tiempo real
function busquedaTiempoReal() {
  const searchInput = document.getElementById("artist");

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === "") {
      getAllEvents();
      return;
    }

    //URL para buscar eventos
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=60&city=Marbella&locale=*`;

    fetchEvents(url);
  });
}

// Función para obtener todos los eventos de Marbella
function getAllEvents() {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=50&city=Marbella&locale=*`;
  fetchEvents(url);
}

// Función para obtener la imagen del evento
function getImageUrl(event) {
  if (event.images && event.images.length > 0) {
    return event.images[0].url;
  }
  return "";
}

// Función para mostrar un evento en la página
function displayEvent(event, imageUrl) {
  const eventsContainer = document.getElementById("events");

  const eventCard = document.createElement("div");
  eventCard.classList.add("event-card");
  eventCard.innerHTML = `
    <h2>${event.name}</h2>
    <p>${event.dates.start.localDate}</p>
    <p>${event._embedded.venues[0].name}, ${event._embedded.venues[0].city.name}</p>
    <img src="${imageUrl}" alt="${event.name}" class="event-image"/>
    <a href="${event.url}" target="_blank">Más información</a>
  `;

  eventsContainer.appendChild(eventCard);
}

// Inicializa la búsqueda en tiempo real y muestra los eventos al cargar
busquedaTiempoReal();
getAllEvents();
