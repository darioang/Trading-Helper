import React, { useState, useEffect } from 'react';
import './TradingDiary.css';
import Navbar from './Navbar.js';
import { db } from './firebase';
import { doc, updateDoc, getDocs, collection, query, where} from 'firebase/firestore';
import { Line } from "react-chartjs-2";
import { Chart, LineController, LinearScale, PointElement, LineElement, CategoryScale } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import BTCTracker from './Component/BTCTracker';

Chart.register(LineController, LinearScale, PointElement, LineElement, CategoryScale);

function TradingDiary() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserSignInStatus = async() => {
            const signedInUser = await checkUserLoginStatus();
            if (!signedInUser) {
                navigate('/Login');
            }
        }
        checkUserSignInStatus();
    },[navigate])

    const [diaryEntries, setDiaryEntries] = useState([]);
    const[formData, setFormData] = useState({
        date: '',
        time: '',
        instrument: '',
        direction: '',
        tradeSize: '',
        profit: '',
        totalProfit: '',
    })

    const [editMode, setEditMode] = useState({
        enabled: false,
        editIndex: null,
        editInnerIndex: null,
    })

    useEffect(() => {
        const fetchDiaryEntries = async () => {
            const signedInUser = await checkUserLoginStatus();
            if (signedInUser) {
                const q = query(collection(db, 'Login'), where('online', '==', true))
                const querySnapshot = await getDocs(q);
                const entries = querySnapshot.docs.map((doc) => doc.data().diary || []);
                setDiaryEntries(entries);
            }
        }

        fetchDiaryEntries();
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
          }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const signedInUser = await checkUserLoginStatus();

        if (signedInUser){
            const docRef = doc(db, 'Login', signedInUser.id);
            const newDiaryEntry = {
                date: formData.date,
                time: formData.time,
                direction: formData.direction,
                instrument: formData.instrument,
                tradeSize: formData.tradeSize,
                profit: formData.profit,
                totalProfit: formData.totalProfit,
              };
              
            const updatedDiary = signedInUser.diary ? [...signedInUser.diary, newDiaryEntry] : [newDiaryEntry];
            await updateDoc(docRef, {
                diary: updatedDiary,
            })

            setFormData({
                date: '',
                time: '',
                instrument: '',
                direction: '',
                tradeSize: '',
                profit: '',
                totalProfit: '',
            })
        }
    }

    const checkUserLoginStatus = async() => {
        const accountData = await getDocs(collection(db, 'Login'));
        const feedbacks = accountData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        }));

        const signedInUser = feedbacks.find((doc) => doc.online === true);

        return signedInUser;
    }

    
    const handleEditEntry = (index, innerIndex) => {
        setEditMode({
          enabled: true,
          editIndex: index,
          editInnerIndex: innerIndex,
        });
    
        const editedEntry =
          innerIndex !== undefined ? diaryEntries[index][innerIndex] : diaryEntries[index];
    
        setFormData({
          date: editedEntry.date,
          time: editedEntry.time,
          instrument: editedEntry.instrument,
          direction: editedEntry.direction,
          tradeSize: editedEntry.tradeSize,
          profit: editedEntry.profit,
          totalProfit: editedEntry.totalProfit,
        });
      };

      const handleSaveEdit = async () => {
        const signedInUser = await checkUserLoginStatus();
      
        if (signedInUser) {
          const docRef = doc(db, 'Login', signedInUser.id);
      
          const updatedEntries = [...diaryEntries];
          const { editIndex, editInnerIndex } = editMode;
      
          if (
            editIndex !== null &&
            editInnerIndex !== null &&
            editIndex >= 0 &&
            editIndex < updatedEntries.length &&
            editInnerIndex >= 0 &&
            editInnerIndex < updatedEntries[editIndex].length
          ) {
            updatedEntries[editIndex][editInnerIndex] = { ...formData };
          } else if (editIndex !== null && editIndex >= 0 && editIndex < updatedEntries.length) {
            updatedEntries[editIndex] = { ...formData };
          }
      
          // Flatten the updatedEntries array
          const flattenedEntries = updatedEntries.flat();
      
          await updateDoc(docRef, { diary: flattenedEntries });
      
          setDiaryEntries(updatedEntries);
          setFormData({
            date: '',
            time: '',
            instrument: '',
            direction: '',
            tradeSize: '',
            profit: '',
            totalProfit: '',
          });
          setEditMode({
            enabled: false,
            editIndex: null,
            editInnerIndex: null,
          });
        }
      };

      const handleCancelEdit = () => {
        setEditMode({
          enabled: false,
          editIndex: null,
          editInnerIndex: null,
        });
        setFormData({
          date: '',
          time: '',
          instrument: '',
          direction: '',
          tradeSize: '',
          profit: '',
          totalProfit: '',
        });
      };
    
    const handleDeleteEntry = (index, innerIndex) => {
        // Create a copy of the diaryEntries state
        const updatedEntries = [...diaryEntries];
      
        // Ensure the index and innerIndex are within valid range
        if (
          index >= 0 &&
          index < updatedEntries.length &&
          innerIndex >= 0 &&
          innerIndex < updatedEntries[index].length
        ) {
          // Remove the specified entry from the inner array
          updatedEntries[index].splice(innerIndex, 1);
      
          // If the inner array becomes empty, remove it from the updatedEntries array
          if (updatedEntries[index].length === 0) {
            updatedEntries.splice(index, 1);
          }
      
          // Flatten the updatedEntries array
          const flattenedEntries = updatedEntries.flat();
      
          // Update the diaryEntries state with the modified entries
          setDiaryEntries(updatedEntries);
      
          // Perform the Firestore update to remove the entry from the database as well
          const findUser = async () => {
            const signedInUser = await checkUserLoginStatus();
            if (signedInUser) {
              const docRef = doc(db, 'Login', signedInUser.id);
              updateDoc(docRef, { diary: flattenedEntries });
            }
          };
      
          findUser();
        } else {
          console.log('Invalid index or innerIndex provided.');
        }
      };
      

    const totalTrades = diaryEntries.flat().length;
    const totalWins = diaryEntries.flat().filter(entry => entry.profit > 0).length;
    const totalLosses = diaryEntries.flat().filter(entry => entry.profit < 0).length;
    const winPercentage = (totalWins / totalTrades) * 100;
    const totalProfit = diaryEntries.flat().reduce((total, entry) => total + Number(entry.profit), 0);

    return (
        <div>
            <Navbar/>
            <BTCTracker />
            {diaryEntries.length > 0 && (
        <div style = {{ width:'400px', height: '300px'}}>
          <h2>Total Profit Graph</h2>
          <Line className = 'totalProfitGraph'
        data={{
            labels: diaryEntries.flatMap((entryArray, index) =>
            Array.isArray(entryArray)
                ? entryArray.map((entry, innerIndex) => `${innerIndex + 1}`)
                : [`${index + 1}`]
            ),
            datasets: diaryEntries.flatMap((entryArray, index) =>
            Array.isArray(entryArray)
                ? [
                    {
                    label: `Dataset ${index + 1}`,
                    data: entryArray.map((entry) => entry.totalProfit),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    },
                ]
                : [
                    {
                    label: `Dataset ${index + 1}`,
                    data: [entryArray.totalProfit],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true,
                    },
                ]
            ),
        }}
        options={{
            scales: {
            x: {
                title: {
                display: true,
                text: 'Trades Taken',
                },
            },
            y: {
                title: {
                display: true,
                text: 'Total Profit',
                },
                beginAtZero: true,
            },
            },
        }}
        />
        </div>
      )}
            {/* New section to display total trades, wins, losses, win percentage, and total profit */}
            <div className = 'statistics'>
        <h2>Trade Summary</h2>
        <p>Total Trades: {totalTrades}</p>
        <p>Total Wins: {totalWins}</p>
        <p>Total Losses: {totalLosses}</p>
        <p>Win Percentage: {winPercentage.toFixed(2)}%</p>
        <p>Total Profit: {totalProfit}</p>
      </div>
            <form onSubmit = {handleSubmit}>
                <label>
                    Date:
                </label>
                <textarea type="date" name = 'date' value={formData.date} onChange={handleInputChange} required> </textarea>
                
                <label>
                    Time:
                </label>
                <textarea type="time" name="time" value={formData.time} onChange={handleInputChange} required />

                <label>
                    Instrument: 
                </label>
                <textarea type="text" name="instrument" value={formData.instrument} onChange={handleInputChange} required />

                <label>
                    Direction:
                </label>
                <textarea type="text" name="direction" value={formData.direction} onChange={handleInputChange} required />

                <label>
                    Trade Size:
                </label>
                <textarea type="number" name="tradeSize" value={formData.tradeSize} onChange={handleInputChange} required />

                <label>
                    Profit:
                </label>
                <textarea type="number" name="profit" value={formData.profit} onChange={handleInputChange} required />

                <label>
                    Total Profit:
                </label>
                <textarea type="number" name="totalProfit" value={formData.totalProfit} onChange={handleInputChange} required />

                <button type = 'submit'>
                    Add Entry
                </button>
            </form>

            <div className="spacing"></div>

            <div>
                {diaryEntries.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th style={{ paddingRight: '20px' }} >#</th>
                                <th style={{ paddingRight: '50px' }} >Date</th>
                                <th style={{ paddingRight: '20px' }}>Time</th>
                                <th style={{ paddingRight: '20px' }}>Instrument</th>
                                <th style={{ paddingRight: '20px' }}>Direction</th>
                                <th style={{ paddingRight: '20px' }}>Trade Size</th>
                                <th style={{ paddingRight: '20px' }}>Profit</th>
                                <th style={{ paddingRight: '20px' }}>Total Profit</th>
                                <th style={{ paddingRight: '20px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diaryEntries.map((entryArray, index) => (
                                Array.isArray(entryArray) ? (
                                    entryArray.map((entry, innerIndex) => (
                                        <tr key={`${index}-${innerIndex}`}>
                                            <td>{`${innerIndex + 1}`}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.time}</td>
                                            <td>{entry.instrument}</td>
                                            <td>{entry.direction}</td>
                                            <td>{entry.tradeSize}</td>
                                            <td>{entry.profit}</td>
                                            <td>{entry.totalProfit}</td>
                                            <td>
                                                {editMode.enabled && editMode.editIndex === index && editMode.editInnerIndex === innerIndex ? (
                                                    <>
                                                        <button onClick={handleSaveEdit}>Confirm</button>
                                                        <button onClick={handleCancelEdit}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditEntry(index, innerIndex)}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteEntry(index, innerIndex)}>
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr key={index}>
                                    <td>{`${index + 1}`}</td>    
                                    <td>{entryArray.date}</td>
                                    <td>{entryArray.time}</td>
                                    <td>{entryArray.instrument}</td>
                                    <td>{entryArray.direction}</td>
                                    <td>{entryArray.tradeSize}</td>
                                    <td>{entryArray.profit}</td>
                                    <td>{entryArray.totalProfit}</td>
                                    <td>
                                        {editMode.enabled && editMode.editIndex === index ? (
                                            <>
                                                <button onClick={handleSaveEdit}>Confirm</button>
                                                <button onClick={handleCancelEdit}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditEntry(index)}>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteEntry(index)}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                  </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No diary entries found</p>
                )}
            </div>



        </div>
        
    )
}

export default TradingDiary