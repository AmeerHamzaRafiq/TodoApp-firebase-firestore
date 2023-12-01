import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

import { auth, db } from "./confige.js";



const inputBox = document.querySelector(".input-box");
const listContainer = document.querySelector("#list-container");
const btn = document.querySelector(".submitBtn");

let tasksArray = [];

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
    const userQuerySnapshot = await getDocs(userQuery);

    userQuerySnapshot.forEach((userDoc) => {
      console.log(userDoc.data());
      document.querySelector(".user-name").innerText = userDoc.data().name;
    });

    tasksArray = [];
    listContainer.innerHTML = '';

    await renderTasks(user.uid);
  } else {
    window.location = "login.html";
  }
});

async function renderTasks(uid) {
  const tasksQuery = query(collection(db, "tasks"), where("uid", "==", uid), orderBy("timestamp", "asc"));
  const tasksQuerySnapshot = await getDocs(tasksQuery);

  const fragment = document.createDocumentFragment(); 

  tasksQuerySnapshot.forEach((taskDoc) => {
    const taskData = taskDoc.data();
    const taskId = taskDoc.id;

    const existingTask = tasksArray.find((t) => t.id === taskId);
    if (!existingTask) {
      tasksArray.push({ id: taskId, ...taskData });

      const li = createTaskElement(taskData.task, taskId);
      fragment.appendChild(li);
    }
  });

  listContainer.appendChild(fragment);
}
function createTaskElement(task, taskId) {
  // Create <li> element
  const li = document.createElement("li");

  // Create <div> for task content
  const div = document.createElement("div");
  div.classList.add("divs");
  div.textContent = task;

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("xButton");
  deleteButton.textContent = "\u00d7";
  deleteButton.addEventListener("click", async () => {
    // Handle delete button click
    await deleteDoc(doc(db, "tasks", taskId));
    console.log("Task deleted from Firestore");
    li.remove();
    tasksArray = tasksArray.filter((t) => t.id !== taskId);
  });

  // Create update button
  const updateButton = document.createElement("button");
  updateButton.classList.add("iconBtn");
  updateButton.innerHTML = '<i class="fa-solid fa-pen fa-sm"></i>';
  updateButton.addEventListener("click", () => {
    // Handle update button click
    updateTask(taskId, task);
  });

  // Append delete and update buttons to the task <div>
  div.appendChild(deleteButton);
  div.appendChild(updateButton);

  // Append the task <div> to the <li> element
  li.appendChild(div);

  // Return the completed <li> element
  return li;
}

async function updateTask(taskId, currentTask) {
  const { value: updateTask, dismiss: isCancelled } = await Swal.fire({
    input: "textarea",
    inputLabel: "Update Task",
    inputValue: currentTask,
    inputAttributes: {
      "aria-label": "Update your task",
    },
    showCancelButton: true,
    cancelButtonText: "Cancel",
  });

  if (isCancelled) {
    // Reload the page or perform any other action on cancel
    location.reload();
    return;
  }

  if (updateTask) {
    try {
      // Your update logic here
      await updateDoc(doc(db, "tasks", taskId), { task: updateTask });
      console.log("Task updated in Firestore");

      const updatedTaskIndex = tasksArray.findIndex((t) => t.id === taskId);
      tasksArray[updatedTaskIndex].task = updateTask;

      // Update the DOM directly
      const li = listContainer.querySelector(`[data-task-id="${taskId}"]`);

      if (li) {
        li.querySelector("span").innerHTML = updateTask;
      } else {
        console.error(
          "Error: Could not find the corresponding li element for taskId:",
          taskId
        );
      }

      // Reload the page after successful update
      Swal.fire({
        icon: 'success',
        title: 'Task Updated!',
        showConfirmButton: false,
        timer: 700,
      }).then(() => location.reload());
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  }
}


inputBox.addEventListener("input", () => renderTasks(auth.currentUser.uid));
btn.addEventListener("click", addTask);

async function addTask() {
  const taskText = inputBox.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const taskObj = {
    task: taskText,
    timestamp: Timestamp.fromDate(new Date()),
    uid: auth.currentUser.uid,
  };

  try {
    const docRef = await addDoc(collection(db, "tasks"), taskObj);
    console.log("Task written with ID: ", docRef.id);

    tasksArray.push({ id: docRef.id, ...taskObj });
    const li = createTaskElement(taskObj.task, docRef.id);
    listContainer.appendChild(li);
  } catch (error) {
    console.error("Error adding task: ", error);
  }

  inputBox.value = "";
}

const logoutButton = document.querySelector(".LogOutBtn");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("logout");
      window.location = "index(login).html";
    })
    .catch((error) => {
      console.error(error);
    });
});
