require("dotenv").config();

var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.dbpassword,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("\nconnected as id " + connection.threadId + "\n");

    readProducts();

});


function readProducts() {
    console.log("Displaying all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        console.table("\n");
        userShopping(res)
    });
}

function userShopping(res) {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id of the product you would like to buy? (Press Q to quit)"
        }
        // {
        //     name: "quantity",
        //     type: "number",
        //     message: "How many units of the product you would like to buy?",
        // }
    ]).then(function (answer) {

        if(answer.id == "q" || answer.id == "Q"){
            console.log("\nThank you!\n");
            connection.end();
            return;
        }

        var productIDs = [];

        for (var product of res) {
            productIDs.push(product.item_id);
        }

        var productIndex = productIDs.indexOf(parseInt(answer.id));

        if (productIndex !== -1) {
            
            // product exists, ask user how many they want to buy
            inquirer.prompt([
                {
                    name: "quantity",
                    type: "number",
                    message: "How many units of the product you would like to buy?",
                }
            ]).then(function (answers) {
               
                for (var product of res) {
                    if(product.item_id === parseInt(answer.id)) {
                        
                        if (parseInt(answers.quantity) > parseInt(product.stock_quantity)) {
                            console.log("\nInsufficient quantity!\n")
                        } else {
        
                            var remainingQuantity = parseInt(product.stock_quantity) - parseInt(answers.quantity);
                            var totalCost = parseInt(answers.quantity) * parseFloat(product.price);
        
                            updateProduct(product.item_id, remainingQuantity, totalCost);
                        }
                    }
                }

               

            });





        } else {
            console.log("\nThis product doesn't exist.\n");
        }







    });
}


function updateProduct(id, quantity, cost) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: quantity
            },
            {
                item_id: id
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log("\nOrder is placed successfully! Your total cost is $" + cost + ".\n");
            readProducts();
            
        });
}