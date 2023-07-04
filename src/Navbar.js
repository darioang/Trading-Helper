import React, { useState, useEffect} from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

function Navbar() {

    const [userSignedIn, setUserSignedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserSignInStatus = async () => {
            const accountData = await getDocs(collection(db, 'Login'));
            const feedbacks = accountData.docs.map((doc) => doc.data());

            const isUserSignedIn = feedbacks.some((doc) => doc.online === true);
            setUserSignedIn(isUserSignedIn);
        }

        checkUserSignInStatus();
    }, [])

    const handleSignOut = async () => {
        const accountData = await getDocs(collection(db, 'Login'));
        const feedbacks = accountData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        }));

        const signedInUser = feedbacks.find((doc) => doc.online === true);

        if (signedInUser) {
            const docRef = doc(db, 'Login', signedInUser.id);
            const data = {
                ...signedInUser,
                online: false,
            };

            await setDoc(docRef,data);
            setUserSignedIn(false);
            navigate('/home');
        }
    }

    return (

        <nav>
            <li> Crypto Trading Helper</li>
            <li> <a href = '/'>Home</a> </li>
            <li> <a href = '/TradingDiary'> Trading Diary</a> </li>
            <li> <a href = '/FundingRate'> Funding Rate</a> </li>
            {userSignedIn ? (
                <button className = 'sign_out_button' onClick={handleSignOut}> Sign Out</button>
            ): (
                <>
                    <Link to = "/SignUp">
                        <button className = 'sign_up_button' > Sign Up</button>
                    </Link>
                    <Link to ="/Login">
                        <button className = 'login_button' > Login</button>
                    </Link>
                </>

            )}  
        </nav>
    );
}

export default Navbar