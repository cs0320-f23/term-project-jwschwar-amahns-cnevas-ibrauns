
import { useState } from "react";
import { ControlledInput } from "../ControlledInput";
import "../../styles/progress.css";
import { auth, database, collectionRef, users} from "../../index";
import {
  collection, addDoc, updateDoc, doc, onSnapshot, getDoc,
  query, where, setDoc
} from "firebase/firestore";
import AccountInfo from "./accountInfo"
import ExerciseHistory from "./exerciseHistory";
import Consistency from "./consistency";


export default function ProgressPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [editVisibility, setEditVisibility] = useState("none");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [currentPage, setCurrentPage] = useState("account info");
  const [infoButton, setInfoButton] = useState("red");
  const [exerciseHistoryButton, setExerciseHistoryButton] = useState("");
  const [consistencyButton, setConsistencyButton] = useState("");

  const exerciseMap = new Map<string, [string]>();
 

  if (auth.currentUser !== null) {
    const currentUser = auth.currentUser;
    const userID = currentUser?.uid;

    if (userID === undefined) {
      setFirstName("");
      setLastName("");
    } else {
      const currentUserDoc = doc(database, "users", userID);

      const getUserData = async () => {
        try {
          const docSnapshot = await getDoc(currentUserDoc);
          if (docSnapshot.exists()) {
            // check to see if the doc exists
            const userData = docSnapshot.data();
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setEmail(userData.email);
          } else {
            setFirstName("");
            setLastName("");
            setEmail("");
          }
        } catch (error) {
          console.error("handle error");
        }
      };
      getUserData();
    }
  }
  
  function handleEditButton() {
    setEditVisibility("flex");
    console.log(editVisibility)
  }

  function handleCloseClick() {
    setEditVisibility("none")
    console.log("hey")
    return undefined;
  }

  async function handleSaveClick() {

    if (auth.currentUser !== null) {
      const currentUser = auth.currentUser;
      const userID = currentUser?.uid;

      const docData = {
        firstName: newFirstName,
        lastName: newLastName,
        email: currentUser.email
      }

      if (userID !== undefined) {
        await setDoc(doc(database, "users", userID), docData)
      }
    }
    setEditVisibility("none")
  }

  function changePage(page: string) {
    setCurrentPage(page);
    if (page == "account info") {
      setInfoButton("red");
      setExerciseHistoryButton("");
      setConsistencyButton("");
    } else if (page == "exercise history") {
      setInfoButton("");
      setExerciseHistoryButton("red");
      setConsistencyButton("");
    } else {
      setInfoButton("");
      setExerciseHistoryButton("");
      setConsistencyButton("red");
    } 
  }
  
    return (
      <div className="progress-page">
        <div className="button-sidebar">
          <button
            className="navigation-button"
            style={{ backgroundColor: infoButton }}
            onClick={() => changePage("account info")}
          >
            Account Info
          </button>
          <button
            className="navigation-button"
            style={{ backgroundColor: exerciseHistoryButton }}
            onClick={() => changePage("exercise history")}
          >
            Exercise History
          </button>
          <button
            className="navigation-button"
            style={{ backgroundColor: consistencyButton }}
            onClick={() => changePage("consistency")}
          >
            Consistency
          </button>
        </div>
        <div className="content">
          {currentPage === "account info" && <AccountInfo />}
          {currentPage === "exercise history" && <ExerciseHistory />}
          {currentPage === "consistency" && <Consistency />}
        </div>
      </div>
    );
  }
