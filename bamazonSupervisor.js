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
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }
    ]).then(function (answer) {

        switch (answer.menu) {
            case "View Products for Sale": displayProductSales(); break;
            case "Create New Department": addDepartment(); break;
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



function addDepartment() {

    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What is the name of the department you would like to add?"
        },
        {
            name: "cost",
            type: "number",
            message: "What is the over-head-costs of the department?"
        }
    ]).then(function (answer) {

        connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: answer.name,
                over_head_costs: parseFloat(answer.cost)
            },
            function (err, res) {
                if (err) throw err;
                console.log("\n" + res.affectedRows + " department addeded!\n");
                displayMenu();
            }
        );
    })
}