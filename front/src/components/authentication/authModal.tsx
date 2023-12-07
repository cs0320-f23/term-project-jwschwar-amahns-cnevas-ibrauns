import { useState } from "react";
import { auth, database, collectionRef, users } from "../../index";
import BrownFitLogo from '../imageBrown/BrownFit.png';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, addDoc, getDocs, doc, query, where , setDoc} from "firebase/firestore";

import "../../styles/login.css";
import { ControlledInput } from "../ControlledInput";
import { text } from "stream/consumers";

export default function AUTHMODAL() {
  const [modalVisibility, setModalVisibility] = useState<string>("none");
  const [loginButtonColor, setLoginButtonColor] = useState<string>("#fff0e0");
  const [emailValue, setEmailValue] = useState(""); // State for the input value
  const [passwordValue, setPasswordValue] = useState(""); // State for the input value
  const [authState, setAuthState] = useState(""); // State for the input value
  const [optionsPageVisibility, setOptionsPageVisibility] = useState("flex");
  const [loginPageVisibility, setLoginPageVisibility] = useState("none");
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [signinSignoutButton, setSigninSignoutButton] =
    useState("Login/Sign up");
  const [currentUser, setCurrentUser] = useState<string | null>("");
  const [userID, setUserID] = useState<string | null>("");
    const [enterNameVisibility, setEnterNameVisibility] = useState("none");

  const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");


  function handleSigninSignoutClick(loginStatus: string) {
    if (loginStatus === "Logout") {
      signOut(auth).then(() => {
        setSigninSignoutButton("Login/Sign up");
        setCurrentUser("");
      });
      // logout
    } else {
      setLoginButtonColor("Red");
      // makes modal appear
      setModalVisibility("flex");
    }
    return undefined;
  }

  function handleCloseClick() {
    setLoginButtonColor("#fff0e0");
    setModalVisibility("none");
    setEmailValue("");
    setPasswordValue("");
    setAuthState("Enter email and password to sign up");
    setOptionsPageVisibility("flex");
    setLoginPageVisibility("none");
    return undefined;
  } 

  function handleLoginClick() {
    setEnterNameVisibility("none");
    setOptionsPageVisibility("none");
    setLoginPageVisibility("block");
    setSubmitButtonText("Login");
    setAuthState("Enter email and password to login");
  }

  function handleSignupClick() {
    setEnterNameVisibility("block");
    setOptionsPageVisibility("none");
    setLoginPageVisibility("block");
    setSubmitButtonText("Sign up");
    setAuthState("Enter email and password to sign up");
    
  }

  function handleSubmit(submitType: string) {
    // sign up user
    if (submitType === "Sign up") {
      createUserWithEmailAndPassword(auth, emailValue, passwordValue)
        .then((cred) => {
          setAuthState("Success!");
          setSigninSignoutButton("Logout");
          const userCred = cred.user;
            const userEmail = userCred.email;
            setCurrentUser(userEmail);
            const userID = userCred.uid
            setDoc(doc(database, "users", userID), {
              // create a doc for that user within the database
              email: userEmail,
              firstName: firstName,
              lastName: lastName,
            });
        })
        .catch((err) => {
          console.log(err.code);
          if (err.code == "auth/weak-password") {
            setAuthState("Password must be at least 6 characters.");
          } else if (err.code == "auth/email-already-in-use") {
            setAuthState("Email already in use. Please sign in.");
          } else if (err.code == "auth/invalid-email") {
            setAuthState("Please enter a valid email.");
          }
        });

    } else if (submitType === "Login") {
      signInWithEmailAndPassword(auth, emailValue, passwordValue)
        .then((cred) => {
          //console.log(cred.user);
          setAuthState("Success!");
          setSigninSignoutButton("Logout");
          const user = auth.currentUser;
          if (user !== null) {
            const userEmail = user.email;
            setCurrentUser(userEmail);
          }
        })
        .catch((err) => {
          if (err.code == "auth/invalid-credential") {
            setAuthState("Invalid email or password. Please try again.");
          } else if (err.code == "auth/invalid-email") {
            setAuthState("Please enter a valid email.");
          } else if ((err.code = "auth/missing-password")) {
            setAuthState("Please enter a password.");
          }
          // setAuthState(err.code)
        });
    }
  }

  return (
    <div>
      {modalVisibility === "flex" && <div className="overlay"></div>}
      <p className="App-header">
        <button
          className="App-header-login"
          aria-label="login button"
          style={{ backgroundColor: loginButtonColor }}
          onClick={() => handleSigninSignoutClick(signinSignoutButton)}
        >
          {signinSignoutButton}
        </button>
        <p className="current-user">{currentUser}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px", // Adjust the width and height as needed
            height: "100px", // Adjust the width and height as needed
            border: "2px solid red", // Red border
            backgroundColor: "#fff", // White background
          }}
        >
          <img
            src={BrownFitLogo}
            alt="BrownFit Logo"
            style={{
              width: "50px", // Adjust the width of the image as needed
              height: "50px", // Adjust the height of the image as needed
            }}
          />
        </div>
        <h1 className="App-header-title">BrownFit</h1>
      </p>

      <div className="modal" style={{ display: modalVisibility }}>
        <span className="close-button" onClick={() => handleCloseClick()}>
          &times;
        </span>
        <div className="modal-content">
          <div style={{ display: optionsPageVisibility }}>
            <button className="login-button" onClick={() => handleLoginClick()}>
              Login
            </button>
            <button
              className="signup-button"
              onClick={() => handleSignupClick()}
            >
              Sign up
            </button>
          </div>
          <div style={{ display: loginPageVisibility }}>
            <fieldset className="input">
              <div className="input-label">
                <div style={{display: enterNameVisibility}}>
                  <legend>First Name:</legend>
                  <ControlledInput
                    type="text"
                    value={firstName}
                    setValue={setFirstName}
                    ariaLabel={"first name input box"}
                    className="email-input" // Add a class name for the password input
                  />
                  <legend>Last Name:</legend>
                  <ControlledInput
                    type="text"
                    value={lastName}
                    setValue={setLastName}
                    ariaLabel={"last name input box"}
                    className="password-input" // Add a class name for the password input
                  />
                </div>

                <legend>Email:</legend>
                <ControlledInput
                  type="text"
                  value={emailValue}
                  setValue={setEmailValue}
                  ariaLabel={"email input box"}
                  className="email-input" // Add a class name for the email input
                />
              </div>
              <div className="input-label">
                <legend>Password:</legend>
                <ControlledInput
                  type="password"
                  value={passwordValue}
                  setValue={setPasswordValue}
                  ariaLabel={"password input box"}
                  className="password-input" // Add a class name for the password input
                />
              </div>
            </fieldset>
            <button
              type="submit"
              className="submitButton"
              aria-label={"submit button"}
              onClick={() => handleSubmit(submitButtonText)}
            >
              {submitButtonText}
            </button>
            <p style={{ marginTop: "35px" }}>{authState}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
