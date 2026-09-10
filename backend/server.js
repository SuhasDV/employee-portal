const http = require("http");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

// Connect to SQLite database
const db = new DatabaseSync(
    path.join(__dirname, "employees.db")
);

// Create table if it doesn't already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        department TEXT NOT NULL
    )
`);

const server = http.createServer((req, res) => {

    // Allow our frontend to communicate with the backend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle browser preflight request
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Test backend
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Employee Portal Backend is running!");
        return;
    }

    // Get all employees
    if (req.method === "GET" && req.url === "/employees") {

        const employees = db
            .prepare("SELECT * FROM employees")
            .all();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(employees));
        return;
    }

    // Add employee
    if (req.method === "POST" && req.url === "/employees") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                const employee = JSON.parse(body);

                const statement = db.prepare(`
                    INSERT INTO employees
                    (name, employee_id, department)
                    VALUES (?, ?, ?)
                `);

                statement.run(
                    employee.name,
                    employee.employeeId,
                    employee.department
                );

                console.log("Employee saved to database:");
                console.log(employee);

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Employee saved successfully!"
                }));

            } catch (error) {

                console.error(error);

                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid employee data"
                }));
            }
        });

        return;
    }

    // Unknown route
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Backend server running on http://localhost:3000");
});