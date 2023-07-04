import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './Home.js';
import SignUp from './SignUp';
import Login from './Login';
import FundingRate from './FundingRate';
import TradingDiary from './TradingDiary';

function App() {

  return (

        <BrowserRouter>
            <Routes>
             <Route index element = {<Home />} />
             <Route path = '/home' element = {<Home />} />
             <Route path = '/SignUp' element = {<SignUp />} />
             <Route path = '/Login' element = {<Login />} />
             <Route path = '/FundingRate' element = {<FundingRate />} />
             <Route path = '/TradingDiary' element = {<TradingDiary />} />
            </Routes>
        </BrowserRouter>

  );
}

export default App;
