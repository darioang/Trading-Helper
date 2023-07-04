import React, { useState } from 'react';
import './Login.css';
import{ collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { updateDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { doc } from 'firebase/firestore';

function Login() {

    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPassword, setCustomerPassword] = useState(""); 
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');


    const submit = (e) => {
        e.preventDefault();

        const getData = async () => {
            const accountData = await getDocs(collection(db, 'Login'));
            const feedbacks = accountData.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            }))
            let matchFound = false;

            feedbacks.forEach((doc) => {
                if (doc.name === customerEmail && doc.password === customerPassword) {
                    updateLoginCollection(doc.id)
                    navigate('/home', {replace: true})
                    matchFound = true;
                }
            })
            
            if (!matchFound) {
                setErrorMessage('Invalid username or password');
            }

            await getData();

            setCustomerEmail('');
            setCustomerPassword('');
            
        }

        const updateLoginCollection = async (id) => {
            const docRef = doc(db, 'Login', id)
            await updateDoc(docRef, {
                online: true
            })
        }

        getData()

        setCustomerEmail('');
        setCustomerPassword('');

    }
    

    return (

        <div className = 'App'>
            <p className = 'caption2'> Welcome to Crypto Trading Helper! </p>
            <div className = 'App_form'>
                <input type = 'text' placeholder = 'Name' value = {customerEmail} onChange = {(e) => setCustomerEmail(e.target.value)}/>
                <input type = 'text' placeholder = 'Password' value = {customerPassword} onChange = {(e) => setCustomerPassword(e.target.value)}/>
                <button className = 'a' onClick = {submit}> Login </button>
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                <p className = 'caption3'> Do not have an account? </p>
                <Link to = '/SignUp'>
                    <button className = 'b'> Create an Account </button>
                </Link>

            </div>

        </div>
    )
}

export default Login