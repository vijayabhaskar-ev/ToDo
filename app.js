//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://vijayabhaskarev:98myphoneda@cluster0.8izpn.mongodb.net/todo?retryWrites=true&w=majority",{useUnifiedTopology: true,useNewUrlParser: true, useFindAndModify: false})

//mongoose schema

const itemsSchema = {
  name:String
};

const listSchema = {
  name:String,
  items:[itemsSchema]                 //array
};
const List = mongoose.model("List",listSchema);


//DataBase
const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
  name:"do something"
});
const item2 = new Item({
  name:"do "
});
const item3 = new Item({
  name:"something"
});
const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

// const day = date.getDate();



//fetching the data from database
Item.find({},function(err,items){

if(items.length === 0){
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully inserted")
    }
    
  });
  res.redirect("/");
  
}else {
  res.render("list", {listTitle: "Today", newListItems: items});
  //console.log(items);
}
  
})
});

//custom lists

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);


List.findOne({name:customListName},function(err,result){                            //checking whether the item exists or not
  if(!result){
    const list = new List({
      name:customListName,
      items:defaultItems
    });

    list.save();
    res.redirect("/"+customListName);
  }else{
    res.render("list", {listTitle: result.name, newListItems:result.items });

  }
})



   

});





app.post("/", function(req, res){

  const itemName = req.body.newItem;
   const listtitle  = req.body.list;
  //saving an item to  the database
const item = new Item({
  name:itemName
});


if(listtitle === "today"){
  item.save();

  res.redirect("/");
  
}else {
  List.findOne({name:listtitle},function(err,data){                   //another moethod to push data into db
    data.items.push(item);
    data.save();
    res.redirect("/"+listtitle);
  })

}









  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});



//for deletiong
app.post("/delete",function(req,res){
  
  const checkedid = req.body.checkbox;
const listname = req.body.listname;

if(listname === "today"){

  Item.deleteOne({_id:checkedid},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("delted successsfully");
    }
  })
  res.redirect("/");
}else {
 
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedid}}},function(err,data){    //$pull is used to delete item
if(!err){
  res.redirect("/"+listname);
}

  }) ;
    
  }
});



// let port = process.env.PORT;
// if(port == null || port == "") {
//   port = 3000;
// }

app.listen(process.env.PORTr, function() {
  console.log("Server started on port 3000");
});
