// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlsov3LNCBgTA4jbBM3827Ft5xG66mOSo",
  authDomain: "agri-iiot.firebaseapp.com",
  databaseURL:
    "https://agri-iiot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agri-iiot",
  storageBucket: "agri-iiot.appspot.com",
  messagingSenderId: "657924866063",
  appId: "1:657924866063:web:969e9e38cca0bfcd85637a",
  measurementId: "G-E1Q9TJSWL8",
};

let tempArr = [30];
let tempArr2 = [30];
let tempArr3=[30];


let humiArr = [68.2];
let humiArr2=[68.2];
let lightbArr=[30];
let count=0;




function authenticate(){
    console.log('page has loaded')
    let auth = JSON.parse(localStorage.getItem('userAuth'));
    if(!auth){
      window.location.href = '/workerLogin.html'
    }
  }
  window.addEventListener('load', authenticate)
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// getting reference to the database
var database = firebase.database();

//getting reference to the data we want
var dataRef1 = database.ref("/Sensor/Humidity");
var dataRef2 = database.ref("/Sensor/Temperature");
var dataRef3 = database.ref("/Sensor/LightBrightness");
var dataRef4 = database.ref("/Sensor/SoilMoistureStatus");

//fetch the data
dataRef1.on("value", function (getdata1) {
  var humi = getdata1.val();
  pushIfNotSame(humiArr, humi);
  humiArr2.push(humi);
  console.log(humi);
  document.getElementById("humidity").innerHTML = humi + "%";
  document.getElementById("humidityAvg").innerHTML = "Avg:"+humiArrayAvg() + "%";
});

dataRef2.on("value", function (getdata2) {
  var temp = getdata2.val();

  pushIfNotSame(tempArr, temp);  
    
  tempArr2.push(temp);
  tempArr3.push(temp);
  document.getElementById("temperature").innerHTML = temp + "&#8451;";
  
  tempArrayAvg();
  document.getElementById("temperatureAvg").innerHTML = 'Avg:'+tempArrayAvg() + "&#8451;";
});

dataRef3.on("value", function (getdata3) {
  var lightBrightness = getdata3.val();
  lightbArr.push(lightBrightness);
  if(count>0){
  let last=tempArr2[tempArr2.length-1];
  console.log(last+"FFF");
  tempArr2.push(last+0.01);
  console.log(tempArr2);
   }
   count++;
  
  console.log(lightBrightness);
  document.getElementById("LightBrightness").innerHTML = lightBrightness + "%";
});

dataRef4.on("value", function (getdata4) {
  var soilMoistureStatus = getdata4.val();
  console.log(soilMoistureStatus);
  document.getElementById("SoilMoistureStatus").innerHTML = soilMoistureStatus;
});

const logoutBtn = document.querySelector("#btn-logout");
logoutBtn.addEventListener("click", () => {
  logout();
});

  function logout(){
    localStorage.removeItem('userAuth');
    //redirect
    authenticate();
  }

function pushIfNotSame(array, newElement) {
  if (array.length === 0 || array[array.length - 1] !== newElement) {
    array.push(newElement);
    console.log(`Pushed: ${newElement}`);
    console.log(array);
  } else {
    console.log(`Did not push: ${newElement} (same as last element)`);
  }
}

let TESTER = document.getElementById("chart");
let TESTER2 = document.getElementById("chart2");
let TESTER3 = document.getElementById("chart3");

let TimeNow = [];
let TimeNow2 = [];
let TimeNow3=[];
function getCurrentTimeHHMM() {
  // Get current time

  let currentTime = new Date();
  // Extract hours and minutes
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  let seconds = currentTime.getSeconds();

  // Format hours and minutes with leading zeros if necessary
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  TimeNow.push(hours + ":" + minutes + ":" + seconds);
  TimeNow2.push(hours + ":" + minutes + ":" + seconds);
  TimeNow3.push(hours + ":" + minutes + ":" + seconds);
  
  return hours + ":" + minutes + ":" + seconds;
  // Return time in "hh:mm" format
}

function updatePlot() {
  getCurrentTimeHHMM();
  if (tempArr.length > 9) {
    tempArr.splice(0, 2);
    console.log(TimeNow);
    TimeNow.splice(0, 2);
    console.log(TimeNow.length);
  }
  if (humiArr.length > 9) {
    humiArr.splice(0, 2);
    console.log(TimeNow2);
    TimeNow2.splice(0, 2);
    console.log(TimeNow2.length);
  }
  if (lightbArr.length > 9) {
    lightbArr.splice(0, 2);
    console.log(TimeNow3);
    TimeNow3.splice(0, 2);
    console.log(TimeNow3.length);
  }
  Plotly.newPlot(
    TESTER,
    [
      {
        x: TimeNow,
        y: tempArr,
      },
    ],
    {
      xaxis: { title: "Time (HH:MM:SS)" },
      yaxis: {
        title: "Temperature (°C)",
        range: [25, 44], // Adjust the range of the y-axis as needed
      },
    }
  );

  Plotly.newPlot(
    TESTER2,
    [
      {
        x: TimeNow2,
        y: humiArr,
      },
    ],
    {
      xaxis: { title: "Time (HH:MM:SS)" },
      yaxis: {
        title: "Humidity (%)",
        range: [55, 95], // Adjust the range of the y-axis as needed
      },
    }
  );
  
  Plotly.newPlot(
    TESTER3,
    [
      {
        x: TimeNow3,
        y: lightbArr,
      },
    ],
    {
      xaxis: { title: "Time (HH:MM:SS)" },
      yaxis: {
        title: "Light Intensity (%)",
        range: [0, 100], // Adjust the range of the y-axis as needed
      },
    }
  );

}

function tempArrayAvg() {
  // Check if the array is empty
  if (tempArr3.length === 0) {
      return 0; // Return 0 for empty array (or you could handle it differently)
  }

  // Calculate the sum of the temperatures
  let tempAverage = 0;
  for (let i = 0; i < tempArr3.length; i++) {
      tempAverage += tempArr3[i];
  }

  // Calculate the average
  let average = tempAverage / tempArr3.length;
  let formattedAverage = average.toFixed(2);

  // Return the average temperature
  return parseFloat(formattedAverage);
}
function humiArrayAvg() {
  // Check if the array is empty
  if (humiArr2.length === 0) {
      return 0; // Return 0 for empty array (or you could handle it differently)
  }

  // Calculate the sum of the temperatures
  let humidityAverage = 0;
  for (let i = 0; i < humiArr2.length; i++) {
    humidityAverage += humiArr2[i];
  }

  // Calculate the average
  let average = humidityAverage / humiArr2.length;
  let formattedAverage = average.toFixed(2);

  // Return the average temperature
  return parseFloat(formattedAverage);
}
setInterval(updatePlot, 2000);
