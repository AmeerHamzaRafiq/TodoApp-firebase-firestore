import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth } from "./confige.js";

const email = document.querySelector("#loginUserEmail");
const password = document.querySelector("#loginPassword");
const form = document.querySelector(".form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  signInWithEmailAndPassword(auth, email.value, password.value)
.then((userCredential) => {
    const user = userCredential.user;
    console.log(user);
    window.location = 'Home.html'
    Swal.fire({
      position: "top-center",
      icon: "success",
      title: "Your successfully signed up",
      showConfirmButton: false,
      timer: 1500,
    });
})
.catch((error) => {

  const errorMessage = error.message;
  console.log(errorMessage);
  Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Email alredy in use",
      footer: '<a href="">Why do I have this issue?</a>',
    });
});
 
});







