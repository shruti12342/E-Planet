import React, { useState, useEffect } from 'react';
import "./testimonal.css";
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  addDoc,
  getDocs,
} from "firebase/firestore";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7OuII_7uoDgvomQQbPVwT9ri5bXqs84M",
  authDomain: "akprortfolio.firebaseapp.com",
  databaseURL: "https://akprortfolio-default-rtdb.firebaseio.com",
  projectId: "akprortfolio",
  storageBucket: "akprortfolio.firebasestorage.app",
  messagingSenderId: "784602760468",
  appId: "1:784602760468:web:02238859fa918e89cbee01",
  measurementId: "G-YPLD4B7HP7"
};

// Initialize Firebase app only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

const Testimonal = () => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testimonals, setTestimonals] = useState([]); // State for fetched data
  const [message,setMessage]= useState('');

  // Fetch data from Firestore
  useEffect(() => {
    const fetchTestimonals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'testimonals'));
        const testimonalData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTestimonals(testimonalData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchTestimonals();
  }, []);

  // Handle file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
  const handleDelete = async (testimonalID) => {
    try {
      await deleteDoc(doc(db, "testimonals", testimonalID));
      setMessage(`Testimonal Item Delete withID : ${testimonalID}`);
      const querySnapshot = await getDocs(collection(db, "testimonals"));
      const testimonalData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestimonals(testimonalData);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      setMessage(`Error Dlt Item : ${error.message}`);
    }
  };

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !title || !description) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'eventUpload'); // Cloudinary preset

    try {
      // Upload to Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/dgiqgdaa1/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      const uploadedImageUrl = data.secure_url;

      // Save data to Firestore
      await addDoc(collection(db, 'testimonals'), {
        imageUrl: uploadedImageUrl,
        title,
        description,
        date: new Date().toISOString(),
      });

      alert('Data uploaded successfully!');
      setImage(null);
      setTitle('');
      setDescription('');

      // Refresh the list of testimonals after upload
      setTestimonals(prev => [
        ...prev,
        {
          imageUrl: uploadedImageUrl,
          title,
          description,
          date: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error uploading data:", error);
      alert('Failed to upload data. Please try again.');
    }
  };

  return (
    <div>
      {/* Testimonal Form Block */}
      <div id="testimonalBlock">
        <h2>Upload Testimonal</h2>
        <form id="uploadImageForm" onSubmit={handleUpload}>
          <label htmlFor="imageUpload">Select Image:</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            required
          />

          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
            required
          ></textarea>

          <button type="submit" className="upload-button">
            Upload
          </button>
        </form>
      </div>

      {/* Testimonal Images Section */}
      <div id="testimonalImageSection">
        <h2>Testimonals</h2>
        <div className="testimonal-cards">
          {testimonals.map((testimonal) => (
            <div key={testimonal.id} className="testimonal-card">
              <img
                src={testimonal.imageUrl}
                alt={testimonal.title}
                className="testimonal-image"
              />
              <h3 className="testimonal-title">{testimonal.title}</h3>
              <p className="testimonal-description">{testimonal.description}</p>
              <button onClick={()=> handleDelete(testimonal.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default Testimonal;
