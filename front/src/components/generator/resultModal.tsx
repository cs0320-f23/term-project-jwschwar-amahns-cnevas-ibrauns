import { mock } from "node:test";
import { useState } from "react";
import abCrunch from "../nelsonMachines/abCrunch.png";
import treadmill from "../nelsonMachines/treadmill.png";
import legPress from "../nelsonMachines/legPress.png";

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
  FieldValue
} from "firebase/firestore";
import "../../styles/login.css";
//import {BrownLogo} from "../

export interface InputProps {
  durationValue: string;
  muscleValue: string;
  muscleValue2: string;
  goalValue: string;
  modalVisibility: string;
  setModalVisibility: React.Dispatch<React.SetStateAction<string>>;
  workoutMap: Array<any>;
}

export default function RESULTMODAL({
  durationValue,
  muscleValue,
  muscleValue2,
  goalValue,
  modalVisibility,
  setModalVisibility,
  workoutMap,
}: InputProps) {
  //TODO: make call to backend and retrieve json with exercises
  // Go through json and extract name, image, and instructions for each exercise
  // add each to a list? map? tbd doesn't really matter

  let exerciseList: any[];
  const [infoVisibility, setInfoVisibility] = useState("none"); // State for the input value
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  let showImg = "none";
  
  //here, exeriseList correctly reads in the back end workout generated.
  //just need to figure out how to display it
  exerciseList = workoutMap;
  const map = new Map(
    exerciseList.map((obj) => [
      obj.name,
      obj.img ? obj.img + " " + obj.instructions : " " + obj.instructions,
    ])
  );

  const newExerciseHistory = Array.from(map).map(([key, value]) => {
    return {
      exercise: key,
      rating: 0,
      image: value[0],
      description: value[1], // TODO: this is only returning the first letter of the description - need to fix
    };
  });



  function handleCloseClick() {
    setModalVisibility("none");
    updateExerciseHistory();

    return undefined;
  }

  function getImg(val: string) {
    let spaceIndex = val.indexOf(" ");
    let imgPath = val.substring(0, spaceIndex);
    if (imgPath.includes("/")) {
      showImg = "block";
    } else {
      showImg = "none";
    }
    return "src/components" + val.substring(0, spaceIndex);
  }

  function getInstructions(val: string) {
    let spaceIndex = val.indexOf(" ");
    return val.substring(spaceIndex, val.length);
  }

  const handleExerciseClick = (key: string) => {
    setInfoVisibility("flex");
    if (clickedItem === key) {
      setClickedItem(null);
      setInfoVisibility("none");
    } else {
      setClickedItem(key);
    }
  };

  async function updateExerciseHistory() {
    if (auth.currentUser !== null) {
      if (auth.currentUser !== null) {
        const currentUser = auth.currentUser;
        const userID = currentUser?.uid;
        const currentUserDoc = doc(database, "users", userID);

         const docSnapshot = await getDoc(currentUserDoc);
        if (docSnapshot.exists()) {
          // check to see if the doc exists
          const userData = docSnapshot.data();
          const userExerciseHist = userData.exerciseHistory;

          const mergedExerciseData = userExerciseHist.concat(newExerciseHistory)
        
          const docData = {
            exerciseHistory: mergedExerciseData
          };

          if (userID !== undefined) {
            await setDoc(doc(database, "users", userID), docData, {
              merge: true,
            });
         }
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
            <div>
              <p>Duration: {durationValue}</p>
              <p>Muscle 1: {muscleValue}</p>
              <p>Muscle 2: {muscleValue2}</p>
              <p>Goal: {goalValue}</p>
            </div>
            <p>Click any exercise to view more info</p>
            <div>
              {Array.from(map).map(([key, value]) => (
                <div key={key}>
                  <p
                    className="hover-area"
                    onClick={() => handleExerciseClick(key)}
                  >
                    {key}
                  </p>
                  {clickedItem === key && (
                    <div>
                      <img
                        src={getImg(value)}
                        alt={`Image for ${key}`}
                        style={{
                          width: "400px", // Adjust the width of the image as needed
                          height: "400px", // Adjust the height of the image as needed
                          display: showImg,
                        }}
                      />
                      <p>{getInstructions(value)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
