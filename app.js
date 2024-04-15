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
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name : String
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const defaultItems = [
{ name: "Welcome to your todo list!" },
{ name: "Write and press on the plus sign to add an item." },
{ name: "<== Press this to delete - scratch - an item." }
];
 
async function insertDefaultItems(){ 
  try{
    const insertedItems = await Item.insertMany(defaultItems); // check this to fix the bug
    insertedItems.forEach(insertedItem=>deafultItemsList.push(insertedItem.name)); // delete this and return insertedItems.
    console.log("Successfully inserted default items to DB",defaultItems);
    return deafultItemsList; 
  }
  catch (err) {
    console.error("Error inserting default items:",err);
    throw err;
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
    throw err;
  }
}

const userItemsCustomList = [];
const deafultItemsList = [];
const userItemsList = [];  
app.get("/", async function(req, res) {
  
  let day = "Today";
  try {
    const response = await Item.find({}); 
    if (response.length===0 && userItemsList.length === 0) { // get rid of '&& userItemsList.length === 0'
      await insertDefaultItems(); // something wrong with the async here 
      res.render("list", {
      listTitle: day,
      newListItems: deafultItemsList 
      });

    }
    else {
      res.render("list", {
        listTitle: day,
        newListItems: response 
      });

    }
  }
  catch (err) {
    console.error("Error:",err);
    res.status(500).send("An error occurred while fetching data");
  }  
});

app.post("/",async function(req, res){

  const userItem = req.body.newItem;
  const listName = req.body.list;
  
  
  /*
  response => :
  [
  {
    _id: new ObjectId('661c766a36609f42567477d7'),
    name: 'work',
    items: [ [Object], [Object], [Object] ],
    __v: 0
  }
] 
  */
  try {
    if (listName === "Today"){
      await insertUserInput(userItem);
      res.redirect("/");
    }
    else {
      const response = await List.findOne({name: listName});
      if (response){
        response.items.push({name:userItem});
        await response.save();
        console.log(response);
        res.redirect("/"+listName);
      }
      else {
        res.status(404).send("List not found");
      }
      
    }
  }
  catch (err) {
    console.error("Error occurred while inserting user input:",err);
    res.status(500).send("An error occurred while adding the new item");
  }

});

app.post("/delete", function(req,res){
  const checkedItemId =  req.body.checkbox; 
  Item.findByIdAndDelete(checkedItemId)
    .then(()=>{
      console.log("Sucessfully deleted from DB");
      res.redirect("/");
    })  
    .catch ((err)=>{
      console.error("Error deleting item:",err);
      res.status(500).send("An error occurred while deleting the item");
      })
})

app.get("/:customListName",async (req,res)=>{
  const customListName = req.params.customListName;
  const defaultItemsObject = defaultItems.map(defaultItem=> new Item({name:defaultItem.name}))
  const response = await List.find({name:customListName});
  
  
  //  create a new list with customListName, else
  //  the list with customListName already exists.
  
  
  
  if (response.length === 0){  
    const list = new List({
      name:customListName,
      items: defaultItemsObject 
    })
    await List.create(list)
    // create a new custom list
    console.log("New list created:", customListName);
    
    res.redirect("/"+customListName);
  }

  else {
    // render an exsiting todo list
    
    console.log("List already exists:", customListName);
    res.render("list", {listTitle:customListName, newListItems:response[0].items});

  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
