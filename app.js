const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
const mongoose = require("mongoose");
const _ = require("lodash");
// var items = ["Beli Makan", "Makan-Makan"];
let workItems = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://Raefan-Test:polos123@cluster0.csatmvj.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "Selamat Datang di todolist kamu"
});
const item2 = new Item ({
  name: "Klik tombol + untuk menambahkan list"
});
const item3 = new Item ({
  name: "Klik tombol - untuk menghapus list"
});

const defaultItems = [item1,item2,item3];

app.post("/", function(req,res) {
  const options = { weekday: 'long'};
  const d = new Date();
  const today = d.toLocaleDateString("en-US", options) + ",";

  const itemName = req.body.todolist;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === today) {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name:listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect('/work');
  // } else {
  //   items.push(item);
  //   res.redirect('/');
  // }
});

app.post("/delete", function(req,res) {
  const listName = req.body.listName;
  const listId = req.body.checkbox;
  const options = { weekday: 'long'};
  const d = new Date();
  const today = d.toLocaleDateString("en-US", options) + ",";

  Item.findByIdAndRemove(listId, function(err) {
    if (listName === today) {
      if (!err) {
        console.log("Succesfully Delete");
        res.redirect('/');
      }
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: listId }}}, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }
  });
});

app.get('/', function(req,res) {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const d = new Date();
  const today = d.toLocaleDateString("en-US", options);

  Item.find(function(err, items) {
    if (err) {
      console.log(err);
    }
    else if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("default items berhasil dimasukkan");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {titleSection:today, newList: items});
    }
  });
});


app.get("/:parameter", function(req,res) {
  const customListName = _.capitalize(req.params.parameter);

  const list = new List ({
    name: customListName,
    items : defaultItems
  });

  List.findOne({name:customListName}, function(err,results){
    if (!err) {
      if (!results){
        const list = new List ({
            name: customListName,
            items : defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
      } else {
        res.render("list", {titleSection:results.name, newList: results.items});
      }
    }

  });

});

// app.get('/work', function(req,res) {
//   res.render("list", {titleSection:"Work List", newList:workItems});
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
