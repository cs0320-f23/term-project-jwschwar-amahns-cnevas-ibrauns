import { useState, useEffect, ChangeEvent } from "react";
import "../../styles/progress.css";
import { auth, database } from "../../index";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { it } from "node:test";
import { ControlledInput } from "../ControlledInput";

export default function ExerciseHistory() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addModalVisibility, setAddModalVisibility] = useState("none");
  const [exerciseInfoVisibility, setExerciseInfoVisibility] = useState("none");
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentRating, setCurrentRating] = useState<number | null>();
  const [currentReps, setCurrentReps] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentDate, setCurrentDate] = useState<Date | number | Timestamp| null>();
  const [viewDataVisibility, setViewDataVisibility] = useState("flex");
  const [editDataVisibility, setEditDataVisibility] = useState("none");
  const [saveEditButton, setSaveEditButton] = useState("Edit");

  const [successMess, setSuccessMess] = useState("");

  const [exerciseHistNames, setExerciseHistNames] = useState<string[]>([]);

  interface ExerciseInfo {
    rating: number;
    exercise: string;
    description: string;
    image: string;
    date: Timestamp;
    reps: number | null;
    weight: string | null;
  }

  const [exerciseHistory, setExerciseHistory] = useState<ExerciseInfo[]>([]);

  function setupPage() {
    if (auth.currentUser !== null) {
      const currentUser = auth.currentUser;
      const userID = currentUser?.uid;

      if (userID === undefined) {
        setFirstName("");
        setLastName("");
      } else {
        const currentUserDoc = doc(database, "users", userID); // get document of current logged in user
        console.log(userID);
        const getUserData = async () => {
          try {
            const docSnapshot = await getDoc(currentUserDoc);
            if (docSnapshot.exists()) {
              // check to see if the doc exists
              const userData = docSnapshot.data();
              const exerciseList: ExerciseInfo[] = userData.exerciseHistory; // get user's current exercise history
              setExerciseHistory(exerciseList);
              const names = exerciseList.map((item) => item.exercise);

              setExerciseHistNames(names); // set exercise history to be those names
            }
          } catch (error) {
            console.error(error);
          }
        };
        getUserData();
      }
    }
  }

  useEffect(() => {
    setupPage();
  }, []);

  function openAddExercise() {
    setAddModalVisibility("flex");
  }

  function closeAddExercise() {
    setAddModalVisibility("none");
    setSuccessMess("");
  }

  function closeInfoPopup() {
    setExerciseInfoVisibility("none");
    setSuccessMess("");
    setEditDataVisibility("none");
    setViewDataVisibility("flex");
    setSaveEditButton("Edit");
  }

  function openInfoPopup(currentEx: string) {
    if (auth.currentUser !== null) {
      const currentUser = auth.currentUser;
      const userID = currentUser?.uid;

      if (userID === undefined) {
        setFirstName("");
        setLastName("");
      } else {
        const currentUserDoc = doc(database, "users", userID); // get document of current logged in user
        console.log(userID);
        const getCurrentData = async () => {
          try {
            const docSnapshot = await getDoc(currentUserDoc);
            if (docSnapshot.exists()) {
              // check to see if the doc exists
              const userData = docSnapshot.data();
              const exerciseList: ExerciseInfo[] = userData.exerciseHistory; // get user's current exercise history
              for (
                let itemIndex = 0;
                itemIndex < exerciseList.length;
                itemIndex++
              ) {
                if (currentEx === exerciseList[itemIndex].exercise) {
                  const seconds = exerciseList[itemIndex].date.seconds;

                  setCurrentDate(new Date(seconds * 1000));
                  const reps = exerciseList[itemIndex].reps;
                  if (reps === null || Number.isNaN(reps)) {
                    setCurrentReps("N/A");
                  } else if (reps !== null) {
                    setCurrentReps(reps.toString());
                  }

                  const weight = exerciseList[itemIndex].weight;
                  if (weight === null || Number.isNaN(weight)) {
                    setCurrentWeight("N/A");
                  } else if (weight !== null) {
                    setCurrentWeight(weight.toString());
                  }
                  setCurrentRating(exerciseList[itemIndex].rating);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        };
        getCurrentData();
      }
    }

    setCurrentExercise(currentEx);
    setExerciseInfoVisibility("flex");
    setSuccessMess("");
  }

  const handleRatingChange = (event: React.ChangeEvent<{ value: string }>) => {
    const rating = parseInt(event.target.value);
    setCurrentRating(rating)
  };

      // if (auth.currentUser !== null) {
      //   const currentUser = auth.currentUser;
      //   const userID = currentUser?.uid;
      //   const currentUserDoc = doc(database, "users", userID); // get document of current logged in user
      //   const changeRating = async () => {
      //     try {
      //       const docSnapshot = await getDoc(currentUserDoc);

      //       if (docSnapshot.exists()) {
      //         // check to see if the doc exists
      //         const userData = docSnapshot.data();
      //         const exerciseList: ExerciseInfo[] = userData.exerciseHistory; // get user's current exercise history
      //         const exerciseListCopy = [...exerciseList];
      //         exerciseListCopy[index].rating = rating;
      //         // exerciseList[index]
      //         const docData = {
      //           exerciseHistory: exerciseListCopy,
      //         };

      //         if (userID !== undefined) {
      //           // set the exercise list with updated ratings
      //           await setDoc(doc(database, "users", userID), docData, {
      //             merge: true,
      //           });
      //         }
      //       }
      //     } catch (error) {
      //       console.error(error);
      //     }
    //      };
    //     changeRating();
      
    // };

  function handleDeleteExercise(index: number) {
    if (auth.currentUser !== null) {
      const currentUser = auth.currentUser;
      const userID = currentUser?.uid;
      const currentUserDoc = doc(database, "users", userID); // get document of current logged in user
      const deleteExercise = async () => {
        try {
          const docSnapshot = await getDoc(currentUserDoc);

          if (docSnapshot.exists()) {
            // check to see if the doc exists
            const userData = docSnapshot.data();
            const exerciseList: ExerciseInfo[] = userData.exerciseHistory; // get user's current exercise history

            for (
              let itemIndex = 0;
              itemIndex < exerciseList.length;
              itemIndex++
            ) {
              if (
                exerciseHistNames[index] === exerciseList[itemIndex].exercise
              ) {
                exerciseList.splice(itemIndex, 1);
                itemIndex--;
              }
            }

            setExerciseHistNames(exerciseList.map((item) => item.exercise)); // extract exercise names from list

            const docData = {
              exerciseHistory: exerciseList,
            };

            if (userID !== undefined) {
              // set the new  exercies list
              await setDoc(doc(database, "users", userID), docData, {
                merge: true,
              });
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      deleteExercise();
    }
  }

  const saveData = async () => {
    if (auth.currentUser !== null) {
      const currentUser = auth.currentUser;
      const userID = currentUser?.uid;
      const currentUserDoc = doc(database, "users", userID); // get document of current logged in user

      try {
        const docSnapshot = await getDoc(currentUserDoc);

        if (docSnapshot.exists()) {
          // check to see if the doc exists
          const userData = docSnapshot.data();
          const exerciseList: ExerciseInfo[] = userData.exerciseHistory; // get user's current exercise history
          const exerciseListCopy: ExerciseInfo[] = [...exerciseList]; // make copy of exerciseList

          for (
            let itemIndex = 0;
            itemIndex < exerciseList.length;
            itemIndex++
          ) {
            if (currentExercise === exerciseList[itemIndex].exercise) {
              exerciseListCopy[itemIndex].reps = parseInt(currentReps);
              exerciseListCopy[itemIndex].weight = currentWeight;
              //   exerciseListCopy[itemIndex].date = currentDate;
              if (currentRating !== null && currentRating !== undefined) {
                exerciseListCopy[itemIndex].rating = currentRating;
              }
            }
          }

          const docData = {
            exerciseHistory: exerciseListCopy,
          };

          if (userID !== undefined) {
            await setDoc(doc(database, "users", userID), docData, {
              merge: true,
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
  const selectedDate = event.target.value;
  const timestamp = new Date(selectedDate).getTime();
  setCurrentDate(timestamp);
};
  

  function onEditClick() {
    if (saveEditButton === "Save") {
      // save stuff
      saveData();
    }

    if (saveEditButton === "Edit") {
      setSaveEditButton("Save");
      setViewDataVisibility("none");
      setEditDataVisibility("block");
    }
  }
  return (
    <div>
      <div
        className="add-exercise-modal"
        style={{ display: addModalVisibility }}
      >
        <span className="close-button" onClick={() => closeAddExercise()}>
          &times;
        </span>
        <p>Select an exercise to add to your history:</p>
        <select className="selector">
          <option value="Treadmill">Treadmill</option>
          <option value="Leg Press">Leg Press</option>
        </select>
      </div>
      <div className="content">
        <p style={{ fontSize: "larger", fontWeight: "bold" }}>
          Exercise History:
        </p>

        <p>
          Welcome to your exercise history!! Here you can view exercises that
          you've saved, delete unwanted exercises, change the rating of an
          exercise so that it becomes more/less frequent, and add your own
          exercises!
        </p>
        <div
          className="exercise-info-modal"
          style={{ display: exerciseInfoVisibility }}
        >
          <span className="close-button" onClick={() => closeInfoPopup()}>
            &times;
          </span>
          <div>
            <div style={{ display: "flex" }}>
              <p className="exercise-info">Exercise: {currentExercise}</p>
              <div>
                <p
                  className="exercise-info"
                  style={{ display: viewDataVisibility }}
                >
                  Last Used: {currentDate && currentDate.toString()}
                </p>
                <div style={{ display: editDataVisibility }}>
                  <label htmlFor="dateInput" className="calendar-popup">
                    Last Used:
                  </label>
                  <input
                    type="date"
                    id="dateInput"
                    name="dateInput"
                    style={{ display: "block" }}
                  ></input>
                </div>
              </div>
              <div>
                <p
                  className="exercise-info"
                  style={{ display: viewDataVisibility }}
                >
                  Latest Reps: {currentReps?.toString()}
                </p>
                <div style={{ display: editDataVisibility }}>
                  <div className="exercise-info-edit">
                    <legend>Reps:</legend>
                    <ControlledInput
                      type="text"
                      value={currentReps}
                      setValue={setCurrentReps}
                      ariaLabel={"reps input box"}
                      className="exercise-info-edit"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p
                  className="exercise-info"
                  style={{ display: viewDataVisibility }}
                >
                  Latest Weights: {currentWeight?.toString()}
                </p>
                <div style={{ display: editDataVisibility }}>
                  <div className="exercise-info-edit">
                    <legend>Weight:</legend>
                    <ControlledInput
                      type="text"
                      value={currentWeight}
                      setValue={setCurrentWeight}
                      ariaLabel={"weight input box"}
                      className="exercise-info-edit"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p
                  className="exercise-info"
                  style={{ display: viewDataVisibility }}
                >
                  Rating: {currentRating?.toString()}
                </p>
                <div style={{ display: editDataVisibility }}>
                  <div className="exercise-info-edit">
                    <label className="rating-dropdown exercise-info">
                      Rating
                      <select className="selector" onChange={handleRatingChange}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => onEditClick()}>{saveEditButton}</button>
          </div>

          {/* <label className="rating-dropdown exercise-info">
            Rating
            <select className="selector">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label> */}
        </div>
        {exerciseHistNames.map((item, index) => (
          <div className="exercise-pair" key={index}>
            <span
              className="delete-button"
              onClick={() => handleDeleteExercise(index)}
            >
              &times;
            </span>

            <p className="exercise" onClick={() => openInfoPopup(item)}>
              {item}
            </p>
          </div>
        ))}
        <button onClick={openAddExercise}>Add exercise</button>
      </div>
    </div>
  );
}
