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
    connection.end();
});