require("dotenv").config();

var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.dbpassword,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    shopping();
});


function shopping() {

    connection.query("select * from products where stock_quantity > 0", function (err, res) { // select the products that have inventory
        if (err) throw err;

        console.log("\nProducts for sale:\n");

        var table = new Table({
            head: ['ID', 'Name', 'Price', "Stock Quantity"]
        });

        for (var item of res) {
            table.push([item.item_id, item.product_name, item.price, item.stock_quantity]);
        }

        console.log(table.toString());
        console.log("\n");


        inquirer.prompt([
            {
                name: "id",
                type: "input",
                message: "What is the id of the product you would like to buy? (Press Q to quit)"
            }
        ]).then(function (answer) {

            // if user wants to quit
            if (answer.id === "q" || answer.id === "Q") {
                console.log("\nThank you!\n");
                connection.end();
                return;
            }

            // if user didn't answer quit, then ask second question
            inquirer.prompt([
                {
                    name: "quantity",
                    type: "number",
                    message: "How many units of the product you would like to buy?",
                }
            ]).then(function (answers) {

                // loop through products array "res" to find the product id that user entered
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id === parseInt(answer.id)) {

                        if (parseInt(answers.quantity) > parseInt(res[i].stock_quantity)) {
                            console.log("\nInsufficient quantity!\n");
                            shopping();
                        } else {

                            var remainingQuantity = res[i].stock_quantity - parseInt(answers.quantity);
                            var totalCost = parseInt(answers.quantity) * res[i].price;
                            var currentProductSale;
                            if (res[i].product_sales) { currentProductSale = res[i].product_sales; } else { currentProductSale = 0; }
                            var newProductSale = currentProductSale + totalCost;
                        
                            updateProduct(res[i].item_id, remainingQuantity, newProductSale, totalCost);
                        }

                        // product is found, stop the loop
                        break;
                    }
                }

                // if i equals array length, that means it has looped through the whole array but didn't find the prodcut id that user entered, then display a message and re-shopping
                if (i === res.length) {
                    console.log("\nThis product doesn't exist.\n");
                    shopping();
                }
            });
        });
    });
}


function updateProduct(id, quantity, sales, cost) {

    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: quantity,
                product_sales: sales
            },
            {
                item_id: id
            }
        ],
        function (err, res) {

            if (err) throw err;
            console.log("\nOrder is placed successfully! Your total cost is $" + cost + ".\n");
            shopping();
        });
}