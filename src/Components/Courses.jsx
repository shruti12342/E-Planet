import React, { useState, useEffect } from "react";
import "./courses.css";
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

const Courses = () => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState([]); // State to store courses

  // Fetch courses from Firestore
 const fetchCourses = async () => {
   const querySnapshot = await getDocs(collection(db, "courses"));
   const coursesData = querySnapshot.docs.map((doc) => ({
     id: doc.id, // Add the document ID
     ...doc.data(),
   }));
   setCourses(coursesData);
 };


  useEffect(() => {
    fetchCourses(); // Fetch courses when component mounts
  }, []);

  // Handle file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDelete = async (CourseID) => {
    try {
      await deleteDoc(doc(db, "courses", CourseID));
      setMessage(`Course Detelete : ${CourseID}`);

      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Ensure document ID is included
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error aya ", error);
      setMessage(`Error Aya : ${error.message}`);
    }
  };

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !title || !className) {
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
      await addDoc(collection(db, "courses"), {
        imageUrl: uploadedImageUrl,
        title,
        className,
        date: new Date().toISOString(),
      });

      alert("Course data uploaded successfully!");
      setImage(null);
      setTitle("");
      setClassName("");

      // Re-fetch courses after upload
      fetchCourses();
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to upload data. Please try again.");
    }
  };

  return (
    <div className="CoursesContainer">
      <div className="CoursesBlock">
        <h2>Courses</h2>
        <form onSubmit={handleUpload}>
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
            placeholder="Enter course title"
            required
          />

          <label htmlFor="className">Class:</label>
          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
            required
          />

          <button type="submit">Upload Course</button>
        </form>
      </div>

      <div className="courses-list">
        <h3>Courses List</h3>
        {courses.length > 0 ? (
          <div className="cards-container">
            {courses.map((course, index) => (
              <div className="card" key={index}>
                <div className="card-image">
                  <img src={course.imageUrl} alt={course.title} />
                </div>
                <div className="card-content">
                  <h4>{course.title}</h4>
                  <p>{course.className}</p>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(course.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No courses available.</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
