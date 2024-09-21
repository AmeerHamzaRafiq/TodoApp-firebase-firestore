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
  const li = document.createElement("li");

  const div = document.createElement("div");
  div.classList.add("divs");
  div.textContent = task;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("xButton");
  deleteButton.textContent = "\u00d7";
  deleteButton.addEventListener("click", async () => {
    await deleteDoc(doc(db, "tasks", taskId));
    li.remove();
    tasksArray = tasksArray.filter((t) => t.id !== taskId);
  });

  const updateButton = document.createElement("button");
  updateButton.classList.add("iconBtn");
  updateButton.innerHTML = '<i class="fa-solid fa-pen fa-sm"></i>';
  updateButton.addEventListener("click", () => {
    updateTask(taskId, task);
  });

  div.appendChild(deleteButton);
  div.appendChild(updateButton);
  li.appendChild(div);

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
    location.reload();
    return;
  }

  if (updateTask) {
    try {
      await updateDoc(doc(db, "tasks", taskId), { task: updateTask });
      const updatedTaskIndex = tasksArray.findIndex((t) => t.id === taskId);
      tasksArray[updatedTaskIndex].task = updateTask;

      const li = listContainer.querySelector(`[data-task-id="${taskId}"]`);
      if (li) {
        li.querySelector("span").innerHTML = updateTask;
      } else {
        console.error("Error: Could not find the corresponding li element for taskId:", taskId);
      }

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

// Add event listener for the Enter key
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

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
      window.location = "index(login).html";
    })
    .catch((error) => {
      console.error(error);
    });
});
