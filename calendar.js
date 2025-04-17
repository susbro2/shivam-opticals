// Google Calendar Integration
class AppointmentManager {
    constructor() {
        this.gapi = null;
        this.calendarId = 'primary';
        this.availableSlots = [];
    }

    async initialize() {
        try {
            const response = await fetch('http://localhost:3000/api/google-key');
            const { apiKey } = await response.json();
            
            await this.loadGoogleAPI(apiKey);
            this.initializeCalendar();
        } catch (error) {
            console.error('Failed to initialize calendar:', error);
        }
    }

    async loadGoogleAPI(apiKey) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:auth2', async () => {
                    await gapi.client.init({
                        apiKey: apiKey,
                        clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace with your client ID
                        scope: 'https://www.googleapis.com/auth/calendar.events',
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
                    });
                    this.gapi = gapi;
                    resolve();
                });
            };
            document.body.appendChild(script);
        });
    }

    initializeCalendar() {
        const calendar = document.getElementById('appointment-calendar');
        if (!calendar) return;

        // Initialize date picker
        const datePicker = document.createElement('input');
        datePicker.type = 'date';
        datePicker.id = 'appointment-date';
        datePicker.min = new Date().toISOString().split('T')[0];
        calendar.appendChild(datePicker);

        // Add time slots container
        const timeSlotsContainer = document.createElement('div');
        timeSlotsContainer.id = 'time-slots';
        calendar.appendChild(timeSlotsContainer);

        datePicker.addEventListener('change', () => this.loadTimeSlots(datePicker.value));
    }

    async loadTimeSlots(date) {
        const timeSlots = document.getElementById('time-slots');
        timeSlots.innerHTML = '<p>Loading available slots...</p>';

        try {
            const startTime = new Date(date);
            startTime.setHours(10, 0, 0); // Start at 10 AM
            const endTime = new Date(date);
            endTime.setHours(19, 0, 0); // End at 7 PM

            const response = await this.gapi.client.calendar.events.list({
                calendarId: this.calendarId,
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.result.items;
            const availableSlots = this.generateAvailableSlots(startTime, endTime, events);
            this.displayTimeSlots(timeSlots, availableSlots);
        } catch (error) {
            timeSlots.innerHTML = '<p>Error loading time slots. Please try again.</p>';
            console.error('Error loading time slots:', error);
        }
    }

    generateAvailableSlots(start, end, existingEvents) {
        const slots = [];
        const slotDuration = 30; // 30-minute slots
        let current = new Date(start);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + slotDuration * 60000);
            const isAvailable = !existingEvents.some(event => {
                const eventStart = new Date(event.start.dateTime);
                const eventEnd = new Date(event.end.dateTime);
                return current < eventEnd && slotEnd > eventStart;
            });

            if (isAvailable) {
                slots.push({
                    start: new Date(current),
                    end: new Date(slotEnd)
                });
            }
            current = slotEnd;
        }
        return slots;
    }

    displayTimeSlots(container, slots) {
        container.innerHTML = '';
        if (slots.length === 0) {
            container.innerHTML = '<p>No available slots for this date.</p>';
            return;
        }

        slots.forEach(slot => {
            const button = document.createElement('button');
            button.className = 'time-slot-btn';
            button.textContent = slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            button.onclick = () => this.bookAppointment(slot);
            container.appendChild(button);
        });
    }

    async bookAppointment(slot) {
        try {
            const event = {
                summary: 'Eye Examination Appointment - Shivam Opticals',
                location: 'Shop no-113 pocket, 13, Pocket 13, Sector-24, Rohini, Delhi, 110085',
                description: 'Eye examination appointment at Shivam Opticals',
                start: {
                    dateTime: slot.start.toISOString(),
                    timeZone: 'Asia/Kolkata'
                },
                end: {
                    dateTime: slot.end.toISOString(),
                    timeZone: 'Asia/Kolkata'
                }
            };

            await this.gapi.client.calendar.events.insert({
                calendarId: this.calendarId,
                resource: event
            });

            alert('Appointment booked successfully!');
            // Refresh available slots
            this.loadTimeSlots(slot.start.toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    }
}

// Initialize appointment manager when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.appointmentManager = new AppointmentManager();
    window.appointmentManager.initialize();
});