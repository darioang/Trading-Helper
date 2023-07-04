import React from 'react';
import './Home.css';
import Navbar from './Navbar.js';
import example from './funding rate.png'
import diaryExample from './diaryExample.png'
import analysisExample1 from './analysisExample1.png'

function Home() {


  return (
    <div>
      <Navbar/>  

      <div className = 'section1'>
        <p className = 'headline'> A Tool For Crypto Traders</p>
        <p className = 'sentence1'> Make better decisions by journaling and analysing</p>
        <a href="/signup" class="getStartedButton">Get Started!</a>
      </div>

      <div className = 'homeSpacing'></div>

      <div className="section2">
        <div className="text-container">
          <p className="home1">Data about all crypto pairs</p>
          <p>Have access to the price changes, funding rate, volume and open interest for all crypto pairs from Bybit</p>
        </div>
        <div className="image-container">
          <img src={example} className="example" alt="example" />
        </div>
      </div>

      <div className = 'homeSpacing1'></div>

      <div className = 'section3'>
        <div className = 'image-container2'>
          <img src = {diaryExample} className = 'diaryExample' alt = 'diaryExample'/>
        </div>
        <div className = 'text-container2'>
          <p className = 'home2'> Easier Jounaling</p>
          <p> Tracks all the trades that you have taken and shows the change in your portfolio value</p>
        </div>
      </div>

      <div className = 'section4'>
        <div className = 'text-container3'>
          <p className = 'home3'> In-Depth Analysis</p>
          <p> Monitor trading progress and analyse performance over every trade</p>
        </div>
        <div className = 'image-container3'>
          <img src = {analysisExample1} className = 'analysisExample1' alt = 'analysisExample1'/>
        </div>
      </div>


    </div> 
    

    
  );

}
  
export default Home;