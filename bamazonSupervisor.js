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
            case "View Product Sales by Department": displayProductSales(); break;
            case "Create New Department": addDepartment(); break;
            case "Exit": connection.end(); break;
        }
    });
}


function displayProductSales() {

    var query = "select d.department_id, d.department_name, d.over_head_costs, sum(p.product_sales) as product_sales, (sum(p.product_sales) - d.over_head_costs) as total_profit from departments d, products p where d.department_name = p.department_name group by d.department_id order by total_profit desc";

    connection.query(query, function (err, res) {
        if (err) throw err;

        console.log("\nProduct Sales by Department:\n");

        var table = new Table({
            head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
        });

        for (var item of res) {
            table.push([item.department_id, item.department_name, item.over_head_costs, item.product_sales, item.total_profit]);
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
                console.log("\n" + res.affectedRows + " department added!\n");
                displayMenu();
            }
        );
    })
}