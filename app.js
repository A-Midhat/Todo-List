

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');


// Item.insertMany([item1,item2,item3]);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name : String
});
const Item = mongoose.model("Item", itemsSchema);

// Array of default items
const defaultItems = [
{ name: "Welcome to your todo list!" },
{ name: "Write and press on the plus sign to add an item." },
{ name: "<== Press this to delete - scratch - an item." }
];
function insertDefaultItems(){
return Item.insertMany(defaultItems)
  .then((items)=>{
    
    items.forEach(item=>itemsList.push(item.name))
    console.log("Successfully added default items");
  })
  .catch((err)=>console.error("Error: Couldn't add items",err))
}

const itemsList = []

app.get("/", function(req, res) {
  let day = "17:17"
  if (itemsList.length === 0) {
    insertDefaultItems()
      .then(()=>{
        res.render("list", {listTitle:day, newListItems:itemsList})
      })
      .catch((err)=>{
        res.status(500).send("An error occurred while adding default items")
      })
  }
  else{
   res.render("list", { listTitle: day, newListItems: itemsList });
}

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    itemsList.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
