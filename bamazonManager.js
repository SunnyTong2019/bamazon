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

displayMenu();


function displayMenu() {

    inquirer.prompt([
        {
            name: "menu",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }
    ]).then(function (answer) {

        switch (answer.menu) {
            case "View Products for Sale": displayProducts(); break;
            case "View Low Inventory": displayLowProducts(); break;
            case "Add to Inventory": addInventory(); break;
            case "Add New Product": addProduct(); break;
            case "Exit": connection.end(); break;
        }
    });
}


function displayProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // display all the products
        console.log("\nAll Products:\n");

        var table = new Table({
            head: ['ID', 'Name', 'Department Name', 'Price', 'Stock Quantity']
        });

        for (var item of res) {
            table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        }

        console.log(table.toString());
        console.log("\n");

        displayMenu();
    });
}


function displayLowProducts() {

    connection.query("SELECT * FROM products where stock_quantity < 5", function (err, res) {
        if (err) throw err;

        // display the products in low inventory
        console.log("\nProducts in Low Inventory:\n");

        var table = new Table({
            head: ['ID', 'Name', 'Department Name', 'Price', 'Stock Quantity']
        });

        for (var item of res) {
            table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        }

        console.log(table.toString());
        console.log("\n");
        displayMenu();
    });
}


function addInventory() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: "id",
                type: "input",
                message: "What is the id of the product you would like to add inventory?"
            },
            {
                name: "quantity",
                type: "number",
                message: "How many units would you like to add?",
            }
        ]).then(function (answer) {

            for (var i = 0; i < res.length; i++) {

                if (res[i].item_id === parseInt(answer.id)) {

                    var quantity = res[i].stock_quantity + parseInt(answer.quantity)

                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: quantity
                            },
                            {
                                item_id: parseInt(answer.id)
                            }
                        ],
                        function (err, res) {

                            if (err) throw err;
                            console.log("\nInventory is added successfully!\n");
                            displayMenu();
                        });

                    // product is found, stop the loop
                    break;
                }
            }

            // if i equals array length, that means it has looped through the whole array but didn't find the prodcut id that user entered, then display a message and re-display menu
            if (i === res.length) {
                console.log("\nThis product doesn't exist.\n");
                displayMenu();
            }
        })
    })
}


function addProduct() {

    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What is the product you would like to add?"
        },
        {
            name: "department",
            type: "input",
            message: "What is the department of the product?"
        },
        {
            name: "price",
            type: "number",
            message: "What is the price of the product?"
        },
        {
            name: "quantity",
            type: "number",
            message: "How many units of the product?",
        }
    ]).then(function (answer) {

        connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: answer.name,
                department_name: answer.department,
                price: parseFloat(answer.price),
                stock_quantity: parseInt(answer.quantity)
            },
            function (err, res) {
                if (err) throw err;
                console.log("\n" + res.affectedRows + " product addeded!\n");
                displayMenu();
            }
        );
    })
}