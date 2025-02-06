import { useState, useEffect } from "react";
import "./ft.css";
import { getDatabase, ref, push, onValue } from "firebase/database";

function TimeSlotSelector() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [date, setDate] = useState(null);

  // Generate time slots
  const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour % 12 === 0 ? 12 : hour % 12} ${
        hour < 12 ? "AM" : "PM"
      }`;
      const end = `${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} ${
        hour + 1 < 12 ? "AM" : "PM"
      }`;
      slots.push(`${start} - ${end}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(9, 18); // 9 AM to 6 PM

  // Get formatted date
  const getFormattedDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const tomorrow = getFormattedDate(1);
  const dayAfterTomorrow = getFormattedDate(2);

  // Default selected date: tomorrow
  useEffect(() => {
    setSelectedDate(tomorrow);
    setDate(new Date()); // Set current date for booking
  }, []);

  // Handle booking a time slot
  const handleClick = (slot) => {
    if (
      bookings.some(
        (booking) => booking.slot === slot && booking.date === selectedDate
      )
    ) {
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to book the slot "${slot}" for ${selectedDate}?`
    );

    if (isConfirmed) {
      const newBooking = {
        date: selectedDate,
      };

      const db = getDatabase();
      const dbRef = ref(db, "bookings");
      push(dbRef, newBooking)
        .then(() => {
          alert(
            `Slot "${slot}" for ${selectedDate} has been successfully booked!`
          );
          
        })
        .catch((error) => {
          console.error("Error submitting booking:", error);
          alert("Failed to book the slot. Please try again.");
        });
    }
  };

  // Fetch bookings from Firebase
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "bookings");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      const bookingsList = data ? Object.values(data) : [];
      setBookings(bookingsList);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div className="timeslot-container">
      <div className="dates">
        <button
          className={`date-button ${
            selectedDate === tomorrow ? "selected" : ""
          }`}
          onClick={() => setSelectedDate(tomorrow)}
        >
          {tomorrow}
        </button>
        <button
          className={`date-button ${
            selectedDate === dayAfterTomorrow ? "selected" : ""
          }`}
          onClick={() => setSelectedDate(dayAfterTomorrow)}
        >
          {dayAfterTomorrow}
        </button>
      </div>

      <h2>Select a Time Slot for {selectedDate}</h2>
      <div className="button-container">
        {timeSlots.map((slot, index) => {
          const isBooked = bookings.some(
            (booking) => booking.slot === slot && booking.date === selectedDate
          );
          return (
            <button
              key={index}
              onClick={() => handleClick(slot)}
              className={`timeslot-button ${isBooked ? "booked" : ""}`}
              disabled={isBooked}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <h2>Bookings for {selectedDate}</h2>
      <div className="bookings-list">
        {bookings
          .filter((booking) => booking.date === selectedDate)
          .map((booking, index) => (
            <div key={index} className="booking-item">
              {booking.slot && (
                <p>
                  <strong>Slot:</strong> {booking.slot}
                </p>
              )}
              {booking.name && (
                <p>
                  <strong>Name:</strong> {booking.name}
                </p>
              )}
              {booking.date && (
                <p>
                  <strong>Date:</strong> {booking.date}
                </p>
              )}
              {booking.className && (
                <p>
                  <strong>Class:</strong> {booking.className}
                </p>
              )}
              {booking.subject && (
                <p>
                  <strong>Subject:</strong> {booking.subject}
                </p>
              )}
            </div>
          ))}
        {/* Show a message if no bookings are available */}
        {bookings.filter((booking) => booking.date === selectedDate).length ===
          0 && <p className="no-bookings">No bookings for this date.</p>}
      </div>
    </div>
  );
}

export default TimeSlotSelector;
