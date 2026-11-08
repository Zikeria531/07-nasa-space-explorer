// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('status');
const photoModal = document.getElementById('photoModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalImage = document.getElementById('modalImage');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch APOD entries when the user asks for the selected date range.
getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', () => photoModal.close());
photoModal.addEventListener('click', (event) => {
	if (event.target === photoModal) {
		photoModal.close();
	}
});

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		statusMessage.textContent = 'Choose a valid date range to continue.';
		return;
	}

	// The APOD endpoint expects dates in YYMMDD format.
	const formattedStart = startDate.slice(2).replaceAll('-', '');
  const formattedEnd = endDate.slice(2).replaceAll('-', '');

  const query = new URLSearchParams({
    date_from: formattedStart,
    date_to: formattedEnd
  });

  const apiUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?${query}`;

	getImagesButton.disabled = true;
	statusMessage.textContent = 'Loading space images...';
	gallery.replaceChildren();

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not load that date range. Please try again.');
		}

		const photos = await response.json();
		photos.sort((firstPhoto, secondPhoto) =>
			firstPhoto.date.localeCompare(secondPhoto.date)
		);

		photos.forEach(showPhoto);
		statusMessage.textContent = `Showing ${photos.length} APOD entries.`;
	} catch (error) {
		statusMessage.textContent = error.message;
	} finally {
		getImagesButton.disabled = false;
	}
}

function showPhoto(photo) {
	const card = document.createElement('article');
	card.className = 'gallery-item';
	card.tabIndex = 0;
	card.setAttribute('role', 'button');
	card.setAttribute('aria-label', `View ${photo.title}`);
	card.addEventListener('click', () => openPhotoModal(photo));
	card.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openPhotoModal(photo);
		}
	});

	const title = document.createElement('h2');
	title.textContent = photo.title;
	card.appendChild(title);

	const date = document.createElement('p');
	date.className = 'photo-date';
	date.textContent = photo.date;
	card.appendChild(date);

	if (photo.media_type === 'image') {
		const image = document.createElement('img');
		image.src = photo.hdurl;
		image.alt = photo.alt || photo.title;
		card.appendChild(image);
	}

	gallery.appendChild(card);
}

function openPhotoModal(photo) {
	modalTitle.textContent = photo.title;
	modalDate.textContent = photo.date;
	modalExplanation.textContent = new DOMParser()
		.parseFromString(photo.explanation, 'text/html')
		.body.textContent;

	if (photo.media_type === 'image') {
		modalImage.src = photo.hdurl;
		modalImage.alt = photo.alt || photo.title;
		modalImage.hidden = false;
		modalVideoLink.hidden = true;
	} else {
		modalImage.hidden = true;
		modalVideoLink.href = photo.url;
		modalVideoLink.hidden = false;
	}

	photoModal.showModal();
}
