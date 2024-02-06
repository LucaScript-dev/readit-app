// Modules
const fs = require("fs").promises;

// DOM nodes
let items = document.getElementById("items");

// Get readerJS content
let readerJS;

fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString();
});

// Track items in storage
exports.storage = JSON.parse(localStorage.getItem("readit-items")) || [];

// Listen for "done" message from reader window
window.addEventListener("message", (e) => {
  // Delete item at given index
  console.log(e.data);
});

// Get selected item index
exports.getSelectedItem = () => {
  // Get selected node
  let currentItem = document.getElementsByClassName("read-item selected")[0];

  // Get item index
  let itemIndex = 0;
  let child = currentItem;
  while ((child = child.previousElementSibling) != null) itemIndex++;

  // Return selected item and index
  return { node: currentItem, index: itemIndex };
};

// Persist storage
exports.save = () => {
  localStorage.setItem("readit-items", JSON.stringify(this.storage));
};

// Set item as selected
exports.select = (e) => {
  // Remove currently selected item class
  this.getSelectedItem().node.classList.remove("selected");

  // Add to clicked item
  e.currentTarget.classList.add("selected");
};

// Move to newly selected item
exports.changeSelection = (direction) => {
  // Get selected item
  let currentItem = this.getSelectedItem();

  // Handle up/down
  if (direction === "ArrowUp" && currentItem.node.previousElementSibling) {
    currentItem.node.classList.remove("selected");
    currentItem.node.previousElementSibling.classList.add("selected");
  } else if (direction === "ArrowDown" && currentItem.node.nextElementSibling) {
    currentItem.node.classList.remove("selected");
    currentItem.node.nextElementSibling.classList.add("selected");
  }
};

// Open selected item
exports.open = () => {
  // Only if we have items (in case of menu open)
  if (!this.storage.length) return;

  // Get selected item
  let selectedItem = this.getSelectedItem();

  // Get item's url
  let contentURL = selectedItem.node.dataset.url;

  // Open item in proxy BrowserWindow
  let readerWin = window.open(
    contentURL,
    "",
    `
    maxWidth=2000,
    maxHeight=2000,
    width=1200,
    height=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1
  `
  );

  // Inject JavaScript with specific item index (selectedItem.index)
};

// Add new item
exports.addItem = (item, isNew) => {
  // Create a new DOM node
  let itemNode = document.createElement("div");

  // Assign "read-item" class
  itemNode.setAttribute("class", "read-item");

  // Set item url as data attribute
  itemNode.setAttribute("data-url", item.url);

  // Add inner HTML
  itemNode.innerHTML = `<img src="${item.screenshot}" /><h2>${item.title}</h2>`;

  // Append new node to "items"
  items.appendChild(itemNode);

  // Attach click handler to select
  itemNode.addEventListener("click", this.select);

  // Attach doubleclick handler to open
  itemNode.addEventListener("dblclick", this.open);

  // If this is the firts item, select it
  if (document.getElementsByClassName("read-item").length === 1) {
    itemNode.classList.add("selected");
  }

  // Add item to storage and persist
  if (isNew) {
    this.storage.push(item);
    this.save();
  }
};

// Add items from storage when app loads
this.storage.forEach((item) => {
  this.addItem(item, false);
});
