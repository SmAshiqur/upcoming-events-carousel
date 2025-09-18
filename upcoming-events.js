document.addEventListener('DOMContentLoaded', () => {
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Get the company slug from URL parameter first, then fallback to data attribute
    const carouselContainer = document.getElementById('carousel-container');
    if (!carouselContainer) {
        return;
    }
    const companySlug = getUrlParameter('company') || (carouselContainer ? carouselContainer.dataset.company : 'default-company');
    console.log("THIS IS IT", carouselContainer.dataset.company)
    const linkStatus = getUrlParameter('link') || carouselContainer.dataset.link || 'open'; // Default to 'open'

    // Check if we have a company slug
    if (!companySlug) {
        console.error('Company slug is required. Please provide it as a URL parameter or data attribute.');
        carouselContainer.innerHTML = '<p>Error: Company slug is missing</p>';
        return;
    }

    // Construct the API URL dynamically
    const apiUrl = `https://api-events.secure-api.net/api/event/get-events/?company=${companySlug}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(apiResponse => {
            if (apiResponse.succeeded && apiResponse.data) {
                displayCarousel(apiResponse.data, linkStatus);
            } else {
                console.error('Error in API Response:', apiResponse.message || 'Unknown error');
                carouselContainer.innerHTML = '<p>No events found</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching API:', error);
            carouselContainer.innerHTML = '<p>Error loading events</p>';
        });
});

function displayCarousel(events, linkStatus = 'open') {
    const carouselWrapper = document.querySelector('.swiper-wrapper');

    // Clear previous slides
    carouselWrapper.innerHTML = '';

    // Get current date for comparison
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Get all future events with images
    const futureEvents = [];
    
    events.forEach(event => {
        // Skip if no image or no date
        if (!event.image || !event.eventDate) return;

        // Parse the event date
        const eventDate = new Date(event.eventDate);
        
        // Skip invalid dates
        if (isNaN(eventDate.getTime())) return;

        // Set event date to start of day for comparison
        eventDate.setHours(0, 0, 0, 0);
        
        // Only include future events (from today onwards)
        if (eventDate >= currentDate) {
            futureEvents.push(event);
        }
    });
    
    if (futureEvents.length === 0) {
        document.getElementById('carousel-container').innerHTML = '<p></p>';
        return;
    }

    // Sort by date (earliest first)
    futureEvents.sort((a, b) => {
        return new Date(a.eventDate) - new Date(b.eventDate);
    });

    // Remove duplicates - if same title appears multiple times, keep only the first one
    const uniqueEvents = [];
    const seenTitles = new Set();

    futureEvents.forEach(event => {
        const title = event.title;
        
        if (!seenTitles.has(title)) {
            seenTitles.add(title);
            uniqueEvents.push(event);
        } else {
        }
    });

    const uniqueValidEvents = uniqueEvents;

  
 

    // Loop through unique valid events and create slides
    uniqueValidEvents.forEach(event => {

        // Build the slide
        const imageUrl = event.image;
        const eventURL = event.eventUrl ? event.eventUrl : '#';
        const eventTitle = event.title ? event.title : 'Untitled Event';

        const eventSlide = document.createElement('div');
        eventSlide.className = 'swiper-slide';

        // Conditionally render the <a> tag based on linkStatus
        const slideContent = linkStatus.toLowerCase() === 'open' && eventURL !== '#'
            ? `<a href="${eventURL}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                    <img src="${imageUrl}" alt="${eventTitle}" style="width: 100%; height: auto;" />
               </a>`
            : `<img src="${imageUrl}" alt="${eventTitle}" style="width: 100%; height: auto;" />`;

        eventSlide.innerHTML = slideContent;
        carouselWrapper.appendChild(eventSlide);
    });

    // Reinitialize Swiper after slides are added
    initializeCarousel();
}

function initializeCarousel() {
    // Destroy existing Swiper instance if it exists
    if (window.swiperInstance) {
        window.swiperInstance.destroy(true, true);
    }

    // Initialize Swiper
    window.swiperInstance = new Swiper('.swiper', {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 15,
        autoplay: {
            delay: 3000, // Adjust autoplay delay
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            // Mobile view
            0: { 
                slidesPerView: 1, // Display 1 slide on mobile
                spaceBetween: 10,
            },
            // Tablet view
            768: { 
                slidesPerView: 2, // Display 2 slides on tablets
                spaceBetween: 15,
            },
            // Desktop view
            1024: { 
                slidesPerView: 3, // Display 3 slides on desktop
                spaceBetween: 15,
            }
        }
    });
}