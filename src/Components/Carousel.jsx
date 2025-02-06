import React, { useState, useEffect } from "react";
import "./carousel.css";
import { initializeApp, getApps } from "firebase/app";
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
  measurementId: "G-YPLD4B7HP7",
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

const Carousel = () => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [carouselData, setCarouselData] = useState([]);
  const [message, setMessage] = useState("");
  // Fetch carousel data from Firestore when component mounts
  useEffect(() => {
    const fetchCarouselData = async () => {
      const querySnapshot = await getDocs(collection(db, "carousels"));
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCarouselData(data);
    };
    fetchCarouselData();
  }, []);

  // Handle file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDelete = async (carouselID) => {
    try {
      await deleteDoc(doc(db, "carousels", carouselID));
      setMessage(`Carousel item deleted with ID: ${carouselID}`);
      // fetch data after deletion
      const querySnapshot = await getDocs(collection(db, "carousels"));
      const updatedData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCarouselData(updatedData);
    } catch (error) {
      console.error("Error deleting carousel item:", error);
      setMessage(`Error deleting carousel item: ${error.message}`);
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !title || !description) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "eventUpload"); // Cloudinary preset

    try {
      // Upload to Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgiqgdaa1/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      const uploadedImageUrl = data.secure_url;

      // Save data to Firestore
      await addDoc(collection(db, "carousels"), {
        imageUrl: uploadedImageUrl,
        title,
        description,
        date: new Date().toISOString(),
      });

      alert("Data uploaded successfully!");
      setImage(null);
      setTitle("");
      setDescription("");

      // Fetch the updated data
      const querySnapshot = await getDocs(collection(db, "carousels"));
      const updatedData = querySnapshot.docs.map((doc) => doc.data());
      setCarouselData(updatedData);
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to upload data. Please try again.");
    }
  };

  return (
    <div id="carouselSection">
      <div id="carouselBlock">
        <h2>Upload Carousel</h2>
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

      {/* Carousel Cards Section */}
      <div id="carouselCards">
        {carouselData.length > 0 ? (
          carouselData.map((item, index) => (
            <div key={index} className="carousel-card">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="carousel-image"
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button onClick={() => handleDelete(item.id) }>Delete</button>
            </div>
          ))
        ) : (
          <p>No carousel items found.</p>
        )}
      </div>
    </div>
  );
};

export default Carousel;
