import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { auth } from "./confige.js";

const email = document.querySelector("#signupUserEmail");
const password = document.querySelector("#signupPassword");
const form = document.querySelector(".form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Your successfully signed up",
        showConfirmButton: false,
        timer: 1300,
      });
      password.value = "";
      email.value = "";
      setTimeout(() => {
        window.location = "Home.html";
      }, 1500);
    })
    .catch((error) => {

      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Email alredy in use",
        footer: '<a href="">Why do I have this issue?</a>',
      });
      console.log(errorMessage);
    });
});
