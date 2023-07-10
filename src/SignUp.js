import React, { useState } from 'react';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';

function SignUp() {

    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPassword, setCustomerPassword] = useState(""); 
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();

        //Add a new document with a generated id

        const addLogin = async () => {
            try {
                const docRef = await addDoc(collection(db, 'Login'), {
                    name: customerEmail,
                    password: customerPassword,
                    online: false,
                });

                await updateDoc(docRef, {
                    id: docRef.id
                })
            } catch (error) {
                console.error('Error adding document: ', error);
            }

            navigate('/home', {replace: true,})
        }

        addLogin();

        setCustomerEmail('');
        setCustomerPassword('');
    }

    return (
        <div className = 'App'>
            <p className = 'caption'> Welcome to Crypto Trading Helper! </p>
            <div className = 'App_form'>
                <input type = 'text' placeholder = 'Name' value = {customerEmail} onChange = {(e) => setCustomerEmail(e.target.value)}/>
                <input type = 'text' placeholder = 'Password' value = {customerPassword} onChange = {(e) => setCustomerPassword(e.target.value)}/>
                <button className = 'a' onClick = {submit}> Create Account</button>
                <p className = 'caption1'> Already have an account? </p>
                <Link to = '/Login'>
                    <button className = 'b'> Login </button>
                </Link>

            </div>

        </div>
    )
}

export default SignUp;
