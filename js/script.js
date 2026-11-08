// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('status');

// NASA provides DEMO_KEY for trying the API without signing up.
// Replace it with your own key from https://api.nasa.gov/ for regular use.
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch APOD entries when the user asks for the selected date range.
getImagesButton.addEventListener('click', getSpaceImages);

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		statusMessage.textContent = 'Choose a valid date range to continue.';
		return;
	}

	// URLSearchParams safely formats the dates and API key for the request URL.
	const query = new URLSearchParams({
		start_date: startDate,
		end_date: endDate,
		api_key: apiKey
	});
	const apiUrl = `https://api.nasa.gov/planetary/apod?${query}`;

	getImagesButton.disabled = true;
	statusMessage.textContent = 'Loading space images...';
	gallery.replaceChildren();

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not load that date range. Please try again.');
		}

		const photos = await response.json();
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

	const title = document.createElement('h2');
	title.textContent = photo.title;
	card.appendChild(title);

	const date = document.createElement('p');
	date.className = 'photo-date';
	date.textContent = photo.date;
	card.appendChild(date);

	if (photo.media_type === 'image') {
		const image = document.createElement('img');
		image.src = photo.url;
		image.alt = photo.title;
		card.appendChild(image);
	} else {
		const mediaLink = document.createElement('a');
		mediaLink.href = photo.url;
		mediaLink.target = '_blank';
		mediaLink.rel = 'noopener noreferrer';
		mediaLink.textContent = 'View this APOD video';
		card.appendChild(mediaLink);
	}

	const description = document.createElement('p');
	description.textContent = photo.explanation;
	card.appendChild(description);

	gallery.appendChild(card);
}
