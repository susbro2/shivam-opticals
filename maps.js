// Initialize Google Maps and Places
let map;
let service;
let infowindow;

const storeLocation = {
    lat: 28.7162,  // Rohini, Delhi coordinates
    lng: 77.1173
};

// Load Google Maps script dynamically
function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.defer = true;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize the map once the API is loaded
async function initializeMap() {
    try {
        // Fetch API key from server
        const response = await fetch('http://localhost:3000/api/google-key');
        const { apiKey } = await response.json();
        
        // Load Google Maps script
        await loadGoogleMapsScript(apiKey);
        
        // Create the map
        map = new google.maps.Map(document.getElementById('map'), {
            center: storeLocation,
            zoom: 15,
            mapId: "SHIVAM_OPTICALS_MAP",
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });

        // Add main store marker
        const mainStoreMarker = new google.maps.Marker({
            position: storeLocation,
            map: map,
            title: "Shivam Opticals",
            animation: google.maps.Animation.DROP,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(50, 50)
            }
        });

        // Add info window for main store
        infowindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 10px;">Shivam Opticals</h3>
                    <p style="margin: 5px 0;">Shop no-113 pocket, 13<br>Pocket 13, Sector-24<br>Rohini, Delhi, 110085</p>
                    <p style="margin: 5px 0;">Phone: +91 9953149890</p>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button onclick="window.location.href='#appointments'" style="padding: 8px 12px;">Book Appointment</button>
                        <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=28.7162,77.1173&destination_place_id=ChIJn6wOs6sDDTkRJxDWrgYZEhE', '_blank')" 
                            style="padding: 8px 12px; background-color: #4285f4;">
                            Get Directions
                        </button>
                    </div>
                </div>
            `
        });

        mainStoreMarker.addListener("click", () => {
            infowindow.open(map, mainStoreMarker);
        });

        // Initialize Places service
        service = new google.maps.places.PlacesService(map);

        // Set up search box
        const input = document.getElementById("places-search");
        const searchBox = new google.maps.places.SearchBox(input);

        map.addListener("bounds_changed", () => {
            searchBox.setBounds(map.getBounds());
        });

        // Listen for search box changes
        searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();
            if (places.length === 0) return;

            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            markers = [];

            // Add new markers
            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
                if (!place.geometry || !place.geometry.location) return;

                markers.push(new google.maps.Marker({
                    map,
                    position: place.geometry.location,
                    title: place.name,
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }
                }));

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        document.getElementById('map').innerHTML = 
            '<div style="padding: 20px; text-align: center;">Failed to load map. Please try again later.</div>';
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeMap);

function searchNearbyStores() {
    const request = {
        location: storeLocation,
        radius: '2000',
        type: ['store'],
        keyword: 'optical store'
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                createMarker(place);
            });
        }
    });
}

function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    });

    google.maps.event.addListener(marker, "click", () => {
        const content = `
            <div>
                <h3>${place.name}</h3>
                <p>${place.vicinity}</p>
                ${place.rating ? `<p>Rating: ${place.rating} ⭐</p>` : ''}
            </div>
        `;
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
}

// Export functions for use in other files
window.initMap = initMap;
window.searchNearbyStores = searchNearbyStores;