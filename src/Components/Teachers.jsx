import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./Teacher.css";

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

// Initialize Firebase app
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

const Teachers = () => {
  const [formData, setFormData] = useState({
    teacherName: "",
    educationAndAchievement: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dgiqgdaa1/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "eventUpload");

    try {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const docRef = await addDoc(collection(db, "teachers"), {
        ...formData,
        imageUrl,
      });

      setMessage(`Teacher added with ID: ${docRef.id}`);
      setFormData({
        teacherName: "",
        educationAndAchievement: "",
        imageUrl: "",
      });
      setImageFile(null);
      fetchTeachers(); // Refresh the list after adding
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teacherList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teacherList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    try {
      await deleteDoc(doc(db, "teachers", teacherId));
      setMessage(`Teacher deleted with ID: ${teacherId}`);
      fetchTeachers(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting teacher:", error);
      setMessage(`Error deleting teacher: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div>
        <h1>Teachers</h1>
        <form onSubmit={handleSubmit}>
          <label>Upload Image:</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            required
          />
          <label>Teacher Name:</label>
          <input
            type="text"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            required
          />
          <br />
          <label>Education And Achievement:</label>
          <input
            type="text"
            name="educationAndAchievement"
            value={formData.educationAndAchievement}
            onChange={handleChange}
            required
          />
          <br />

          <br />
          <button type="submit">Submit</button>
        </form>
        {message && <p>{message}</p>}
      </div>
      <div>
        <h1>Teacher List</h1>
        {teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <ul>
            {teachers.map((teacher) => (
              <li key={teacher.id}>
                <h3>{teacher.teacherName}</h3>
                <p>{teacher.educationAndAchievement}</p>
                {teacher.imageUrl && (
                  <img
                    src={teacher.imageUrl}
                    alt={`${teacher.teacherName}`}
                    style={{ width: "150px", height: "auto" }}
                  />
                )}
                <button onClick={() => handleDelete(teacher.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Teachers;
