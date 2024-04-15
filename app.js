const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");

const app = express();

// Coonect to the MongoDb database
mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
app.set('view engine', 'ejs');

// setup of the Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Define Mongoose schemas and models
const itemsSchema = new mongoose.Schema({
  name : String
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// Default items for initialization
const defaultItems = [
{ name: "Welcome to your todo list!" },
{ name: "Write and press on the plus sign to add an item." },
{ name: "<== Press this to delete - scratch - an item." }
];

// Function to insert default items into the database
async function insertDefaultItems(){ 
  try{
    const insertedItems = await Item.insertMany(defaultItems); 
    insertedItems.forEach(insertedItem=>deafultItemsList.push(insertedItem.name)); 
    console.log("Successfully inserted default items to DB",defaultItems);
    return deafultItemsList; 
  }
  catch (err) {
    console.error("Error inserting default items:",err);
    throw err;
  }
}

// Function to insert user input into the database
async function insertUserInput(userInput){ 
  
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

// Arrays to store retreived items names from DB
const deafultItemsList = [];
const userItemsList = [];  

app.get("/", async function(req, res) {
  
  let day = "Today";
  try {
    const response = await Item.find({}); 
    if (response.length===0 && userItemsList.length === 0) { 
      await insertDefaultItems(); 
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

// Route to handle adding new items
app.post("/",async function(req, res){

  const userItem = req.body.newItem;
  const listName = req.body.list;
  
  try {
    if (listName === "Today"){
      await insertUserInput(userItem);
      res.redirect("/");
    }
    else {
      const foundCustomList = await List.findOne({name: listName});
      if (foundCustomList){
        foundCustomList.items.push({name:userItem});
        await foundCustomList.save();
        console.log("Custom List Found==>",foundCustomList);
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

// Route to handle deleting items
app.post("/delete", function(req,res){
  const listName = req.body.listName;
  console.log("/delete",listName);
  const checkedItemId =  req.body.checkbox;
  if(listName==="Today"){ 
  // for Default or main page
    Item.findByIdAndDelete(checkedItemId)
      .then(()=>{
        console.log("Sucessfully deleted from original DB");
        res.redirect("/");
      })  
      .catch ((err)=>{
        console.error("Error deleting item:",err);
        res.status(500).send("An error occurred while deleting the item");
        });
    }
   else{
    // for custome page    
      
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}})
        .then(()=>{
          console.log("Sucessfully deleted from<",listName,">  DB")
          res.redirect("/"+listName);
        })
        
    }   
          
})

// Route to render the about page
app.get("/about", function(req, res){
  res.render("about");
});

// Route to handle custom lists
app.get("/:customListName",async (req,res)=>{
  const customListName = req.params.customListName; 
  const defaultItemsObject = defaultItems.map(defaultItem=> new Item({name:defaultItem.name}));
  const response = await List.find({name:customListName});
    
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

app.listen(3000, function() {
  console.log("Server live at port 127.0.0.1:3000");
});
