const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employees_dismissal',
    charset: 'utf8mb4'
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/staff', (req, res) => {
    const { lastName, firstName, middleName, position, department, hireDate } = req.body;
    const query = 'INSERT INTO staff (lastName, firstName, middleName, position, department, hireDate) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [lastName, firstName, middleName, position, department, hireDate];

    connection.query(query, values, (err, result) => {
        if (err) throw err;
        req.flash('success', 'Успешно добавлено!');
        res.redirect('/');
    });
});

app.post('/articles_of_dismissal', (req, res) => {
    const { title, reason, licensePlateNumber, accessPointNumber, accessSubpointNumber } = req.body;
    const query = 'INSERT INTO articles_of_dismissal (Title, Reason, licensePlateNumber, Access_point_number, Access_subpoint_number) VALUES (?, ?, ?, ?, ?)';
    const values = [title, reason, licensePlateNumber, accessPointNumber, accessSubpointNumber];

    connection.query(query, values, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.post('/document', (req, res) => {
    const { codeArticleOfDismissal, employeesCode, documentNumber, registrationDate, dateOfDismissal, moneyCompensation } = req.body;
    const query = 'INSERT INTO documents (Code_article_of_dismissal, Employees_code, Document_number, Registration_date, Date_of_dismissal, Money_compensation) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [codeArticleOfDismissal, employeesCode, documentNumber, registrationDate, dateOfDismissal, moneyCompensation];

    connection.query(query, values, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.get('/functions', (req, res) => {
    res.sendFile(__dirname + '/functions.html');
});

app.get('/tables', (req, res) => {
    res.sendFile(__dirname + '/tables.html');
});

app.get('/get-staff-data', (req, res) => {
    const query = 'SELECT * FROM staff';

    connection.query(query, (err, results) => {
        if (err) throw err;

        let tableHTML = '<table><tr>';
        const headers = Object.keys(results[0] || {});
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr>';

        results.forEach(row => {
            tableHTML += '<tr>';
            Object.values(row).forEach(value => {
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</table>';

        res.send(tableHTML);
    });
});


app.get('/get-documents-data', (req, res) => {
    const query = 'SELECT * FROM documents';

    connection.query(query, (err, results) => {
        if (err) throw err;

        let tableHTML = '<table><tr>';
        const headers = Object.keys(results[0] || {});
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr>';

        results.forEach(row => {
            tableHTML += '<tr>';
            Object.values(row).forEach(value => {
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</table>';

        res.send(tableHTML);
    });
});


app.get('/get-article-data', (req, res) => {
    const query = 'SELECT * FROM articles_of_dismissal';

    connection.query(query, (err, results) => {
        if (err) throw err;

        let tableHTML = '<table><tr>';
        const headers = Object.keys(results[0] || {});
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr>';

        results.forEach(row => {
            tableHTML += '<tr>';
            Object.values(row).forEach(value => {
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</table>';

        res.send(tableHTML);
    });
});

app.get('/calculate-compensation-sum', (req, res) => {
    const query = `
        SELECT SUM(Money_compensation) AS total_compensation
        FROM documents;
    `;

    connection.query(query, (err, results) => {
        if (err) throw err;

        const totalCompensation = results[0].total_compensation || 0;
        res.send(`Сумма компенсаций: ${totalCompensation}`);
    });
});

app.get('/count-employees', (req, res) => {
    const query = `
        SELECT COUNT(DISTINCT Code) AS employee_count
        FROM staff;
    `;

    connection.query(query, (err, results) => {
        if (err) throw err;

        const employeeCount = results[0].employee_count;

        if (employeeCount < 2 || employeeCount > 5) {
            const message = `В таблице ${employeeCount} сотрудников`;
            res.send(message);
        } else {
            res.send('');
        }
    });
});

app.get('/average-compensation', (req, res) => {
    const query = `
        SELECT AVG(Money_compensation) AS average_compensation
        FROM documents;
    `;

    connection.query(query, (err, results) => {
        if (err) throw err;

        const averageCompensation = results[0].average_compensation || 0;
        res.json({ average: averageCompensation });
    });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});