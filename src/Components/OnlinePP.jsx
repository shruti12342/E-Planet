import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import "./online.css";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// Initialize Firebase app
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

const Online = () => {
  const [className, setClassName] = useState('');
  const [numTopics, setNumTopics] = useState(0);
  const [topics, setTopics] = useState([]);
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [dataList, setDataList] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'onlineClasses'));
        const fetchedData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDataList(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle number of topics input
  const handleNumTopicsChange = (e) => {
    const value = parseInt(e.target.value, 10);
  
    // Enforce limits
    if (value < 1) {
      alert("You must enter at least 1 topic.");
      setNumTopics(1);
      setTopics(new Array(1).fill(''));
    } else if (value > 12) {
      alert("You can enter a maximum of 12 topics.");
      setNumTopics(12);
      setTopics(new Array(12).fill(''));
    } else {
      setNumTopics(value);
      setTopics(new Array(value).fill(''));
    }
  };
  

  // Handle topic input changes
  const handleTopicChange = (index, value) => {
    const updatedTopics = [...topics];
    updatedTopics[index] = value;
    setTopics(updatedTopics);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate original price and discounted price
    if (!className || topics.some(topic => !topic) || !originalPrice || !discountedPrice) {
      alert("Please fill in all fields.");
      return;
    }

    if (parseFloat(originalPrice) <= parseFloat(discountedPrice)) {
      alert("Original Price must be greater than Discounted Price.");
      return;
    }

    try {
      // Save data to Firestore
      await addDoc(collection(db, 'onlineClasses'), {
        className,
        topics,
        originalPrice,
        discountedPrice,
        date: new Date().toISOString(),
      });

      alert('Data uploaded successfully!');
      setClassName('');
      setNumTopics(0);
      setTopics([]);
      setOriginalPrice('');
      setDiscountedPrice('');

      // Update the displayed data list
      setDataList(prev => [
        ...prev,
        {
          className,
          topics,
          originalPrice,
          discountedPrice,
          date: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error saving data:", error);
      alert('Failed to upload data. Please try again.');
    }
  };

  return (
    <div>
      {/* Form Section */}
      <div id="onlineFormm">
        <h2>Enter Online Class Details</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="className">Class Name:</label>
          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., 8 classes"
            required
          />

          <label htmlFor="numTopics">Number of Topics (1-12):</label>
          <input
            type="number"
            id="numTopics"
            value={numTopics}
            onChange={handleNumTopicsChange}
            placeholder="Enter number of topics"
            min="1"
            max="12"
            required
          />
          <small>Currently adding {numTopics} topic(s).</small>

          {topics.map((topic, index) => (
            <div key={index}>
              <label htmlFor={`topic${index}`}>Topic {index + 1}:</label>
              <input
                type="text"
                id={`topic${index}`}
                value={topic}
                onChange={(e) => handleTopicChange(index, e.target.value)}
                placeholder={`Enter topic ${index + 1}`}
                required
              />
            </div>
          ))}

          <label htmlFor="originalPrice">Original Price:</label>
          <input
            type="number"
            id="originalPrice"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Enter original price"
            required
          />

          <label htmlFor="discountedPrice">Discounted Price:</label>
          <input
            type="number"
            id="discountedPrice"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            placeholder="Enter discounted price"
            required
          />

          <button type="submit">Submit</button>
        </form>
      </div>

      {/* Display Section */}
      <div id="dataDisplay">
        <h2>Online Classes</h2>
        <div className="class-cards">
          {dataList.map((data) => (
            <div key={data.id} className="class-cardd">
              <h3>{data.className}</h3>
              <p><strong>Topics:</strong></p>
              <ul>
                {data.topics.map((topic, idx) => (
                  <li key={idx}>{topic}</li>
                ))}
              </ul>
              <p><strong>Original Price:</strong> {data.originalPrice}</p>
              <p><strong>Discounted Price:</strong> {data.discountedPrice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Online;
