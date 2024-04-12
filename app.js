/*
add a functionality to the checkbox to remove the item from database()
*/

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


const defaultItems = [
{ name: "Welcome to your todo list!" },
{ name: "Write and press on the plus sign to add an item." },
{ name: "<== Press this to delete - scratch - an item." }
];

async function insertDefaultItems(){ // check the logic 
  try{
    const insertedItemsObject = await Item.insertMany(defaultItems);
    insertedItemsObject.forEach(insertedItem=>deafultItemsList.push(insertedItem.name));
    console.log("Successfully inserted default items to DB",defaultItems);
    return deafultItemsList;
  }
  catch (err) {
    console.error("Error inserting default items:",err);
  }
}


async function insertUserInput(userInput){ // UPDATE THE LOGIC
  
  try{ 
    const insertedItem = await Item.create({ name: userInput}); 
    userItemsList.push(insertedItem.name); 
    console.log("Successfully inserted user input to DB <",insertedItem.name,">");
    return insertedItem.name;
  }
  catch (err) {
    console.error("Error inserting user input: ",err);
  }
}

const deafultItemsList = [];
const userItemsList = []; 
app.get("/", async function(req, res) {
  let day = date.getDate();
  try {
    const response = await Item.find({});
    if (response.length===0 && userItemsList.length === 0) {
      await insertDefaultItems();
      
      // handle the error if all items-including-defaultitems
      //are deleted, the app crashes.
      res.render("list", {
      listTitle: day,
      newListItems: deafultItemsList
      });

    }
    else {
      
      res.render("list", {
        listTitle: day,
        newListItems: response //userItemsList ==> response.name
      });

    }
  }
  catch (err) {
    console.error("Error:==>",err);
    res.status(500).send("An error occurred while fetching data");
  }  
});

app.post("/",async function(req, res){

  const userItem = req.body.newItem;
  try {
    await insertUserInput(userItem);
    res.redirect("/")
  }
  catch (err) {
    console.error("Error occurred while inserting user input:",err);
    res.status(500).send("An error occurred while adding the new item");
  }
});

app.post("/delete", function(req,res){
  const checkedItemId =  req.body.checkbox; //better change it to _id
  Item.findByIdAndDelete(checkedItemId)
    .then(()=>{
      console.log("Sucessfully deleted from DB");
      res.redirect("/");
    })  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
