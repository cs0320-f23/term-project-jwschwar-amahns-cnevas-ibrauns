import { mock } from "node:test";
import { useState } from "react";
import abCrunch from "../nelsonMachines/abCrunch.png";
import treadmill from "../nelsonMachines/treadmill.png";
import legPress from "../nelsonMachines/legPress.png";
import "../../styles/login.css";

import { auth, database, collectionRef, users } from "../../index";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  getDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";

export interface InputProps {
  durationValue: string;
  muscleValue: string;
  muscleValue2: string;
  goalValue: string;
  modalVisibility: string;
  setModalVisibility: React.Dispatch<React.SetStateAction<string>>;
}

export default function RESULTMODAL({
  durationValue,
  muscleValue,
  muscleValue2,
  goalValue,
  modalVisibility,
  setModalVisibility,
}: InputProps) {
  //TODO: make call to backend and retrieve json with exercises
  // Go through json and extract name, image, and instructions for each exercise
  // add each to a list? map? tbd doesn't really matter

  const exerciseMap = new Map<string, [string, string]>();
  const [infoVisibility, setInfoVisibility] = useState("none"); // State for the input value
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  exerciseMap.set("Leg Press", [
    legPress,

    "Sit down on the leg press machine and place your legs on the platform in front of you, with your feet approximately " +
      "a foot to one and half feet apart.\n Lower the safety bars holding the platform in place.Press the platform all the way " +
      "up until your legs are fully extended, without locking your knees.\nAs you inhale, slowly lower the platform until your upper " +
      "and lower legs make a 90 - degree angle.\nPush with the heels of your feet and use your quadriceps to go back to the starting " +
      "position.Exhale as you do so.\nRepeat for the number of reps in your set.Make sure that the safety pins are locked properly once you have finished.",
  ]);

  exerciseMap.set("Treadmill", [
    treadmill,
    "Step onto the treadmill and select the speed and incline that you'd like to use. \nWarm up with a slower speed and then work your " +
      "way up to a higher speed.\nAfter you've completed your goal time/distance, either stop the treadmill or gradually slow your speed down until you come to a stop.",
  ]);

  exerciseMap.set("Ab crunch", [
    abCrunch,
    "Select a light resistance and sit down on the ab machine placing your feet under the pads provided and grabbing the top handles. Your arms " +
      "should be bent at a 90 degree angle as you rest the triceps on the pads provided. This will be your starting position.\nAt the same time, begin " +
      "to lift the legs up as you crunch your upper torso. Breathe out as you perform this movement. Tip: Be sure to use a slow and controlled motion. " +
      "Concentrate on using your abs to move the weight while relaxing your legs and feet.\nAfter a second pause, slowly return to the starting position " +
      "as you breathe in.\nRepeat the movement for the prescribed amount of repetitions.",
  ]);

  function handleCloseClick() {
    setModalVisibility("none");
    return undefined;
  }

  const exerciseHistory = Array.from(exerciseMap).map(([key, value]) => {
    return {
      exercise: key,
      rating: 0,
      image: value[0],
      description: value[1]

    }

  });

  

  const handleExerciseClick = (key: string) => {
    updateExerciseHistory();
    setInfoVisibility("flex");
    if (clickedItem === key) {
      setClickedItem(null);
      setInfoVisibility("none");
    } else {
      setClickedItem(key);
    }
  };

  async function updateExerciseHistory() {
    console.log("its called"
    )

  if (auth.currentUser !== null) {
   if (auth.currentUser !== null) {
     const currentUser = auth.currentUser;
     const userID = currentUser?.uid;

     
     const docData = {
       
       exerciseHistory: {
         exerciseHistory
       }
     }
     

     if (userID !== undefined) {
       await setDoc(doc(database, "users", userID), docData, {merge: true});
     }

   }
  }
 
  }
  {
    return (
      <div>
        <div className="workout-modal" style={{ display: modalVisibility }}>
          <span className="close-button" onClick={() => handleCloseClick()}>
            &times;
          </span>
          <div className="modal-content">
          <div className="modal-header">
          
          {muscleValue !== "N/A" && <h3>{muscleValue}</h3>}
          {muscleValue2 !== "N/A" && <h3>& {muscleValue2}</h3>}
          <h3>Duration: {durationValue}</h3>
       
          <h3>Goal: {goalValue}</h3>
                </div>     

            <p>Click any exercise to view more info</p>
             <div className="exercise-menu">
             {Array.from(exerciseMap).map(([key, value]) => (
      <div
        key={key}
        className="exercise-menu-item"
        onClick={() => handleExerciseClick(key)}
      >
        {key}
        <div>
        {clickedItem === key && (
                    <div>
                      <img
                        src={value[0]}
                        alt={`Image for ${key}`}
                        style={{
                          width: "400px", // Adjust the width of the image as needed
                          height: "400px", // Adjust the height of the image as needed
                        }}
                      />
                      <p>{value[1]}</p>
                    </div>
                  )}
                  </div>
      </div>
    ))}
  </div>

  
          </div>
        </div>
      </div>
    );
  }
}
