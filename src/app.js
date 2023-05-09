const express = require("express");
const fs = require("fs");
const app = express();

// Parsing user data from user.json 
const users = JSON.parse(fs.readFileSync(`${__dirname}/../data/users.json`));

app.use(express.json());

/*
Write a GET Request to return all users. 
The response should be in the following format: 
{
    "status": "success",
    "data": {
        "users": [
            {
                "_id": 1,
                "name": "James B",
                "email": "jamesb@example.com"
            },
            ...
        ]
    }
}*/
app.get("/api/v1/users/", (req, res) => {
   try {
        res.status(200).json({
            status: "success",
            data: {
                users,
            },
        });
    } catch (err) {
        res.status(404).json({
            message: "Users Not Found",
            status: "Error",
            error: err,
        });
    }
});


/*
Write a GET Request to return a user by ID. 
The response should be in the following format: 
{
    "status": "success",
    "data": {
        "user": {
            "_id": 1,
            "name": "James B",
            "email": "jamesb@example.com"
        }
    }
}
Return 404 error when user is not found. 
*/
app.get("/api/v1/users/:id", (req, res) => {
    try {
        const user = users.find((user) => user._id === Number(req.params.id));
        if (!user) {
            res.status(404).json({
                message: "User Not Found",
                status: "Error",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (err) {
        res.status(400).json({
            message: "User Fetching Failed",
            status: "Error",
            error: err,
        });
    }
});


/*
Write a POST request to create a new User. 
The response should be in the following format: 
{
    "status": "success",
    "data": {
        "user": {
            "_id": 5,
            "name": "Someone Someone",
            "email": "someone@gmail.com"
        }
    }
}
Generate a new id using the id of the last user in the database, increment it by 1
Return a 400 error when the email or name is missing 
*/
app.post("/api/v1/users/", (req, res) => {
   try {
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({
                message: "Name or Email is missing",
                status: "Error",
            });
            return;
        }
        const id = users[users.length - 1]._id + 1;
        const newUser = {
            _id: id,
            name,
            email,
        };
        users.push(newUser);
        fs.writeFileSync(`${__dirname}/../data/users.json`, JSON.stringify(users));
        res.status(201).json({
            status: "success",
            data: {
                user: newUser,
            },
        });
       } catch (err) {
        res.status(400).json({
            message: "User Creation failed",
            status: "Error",
        });
    }
});

/*
Write a PATCH request to update user's name or email. 
The response should be in the following format: 
{
    "status": "success",
    "data": {
        "users": [
            {
                "_id": 1,
                "name": "James A",
                "email": "jamesA@example.com"
            },
            {
                "_id": 2,
                "name": "James B",
                "email": "jamesb@example.com"
            }, ....
        ]
    }
}
req.body can contain both name and email as well. Update the data based on the parameters recieved in req.body
Return a 404 error if the user is missing, with the following message 
{
    "message": "User not Found"
}
*/
app.patch("/api/v1/users/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let users = JSON.parse(fs.readFileSync("users.json"));
        let found = false;

        users = users.map((user) => {
            if (user._id === id) {
                found = true;
                return {
                    ...user,
                    ...req.body,
                };
            } else {
                return user;
            }
        });

        if (!found) {
            res.status(404).json({
                message: "User not Found",
            });
            return;
        }

        fs.writeFileSync("users.json", JSON.stringify(users));

        res.status(200).json({
            status: "success",
            data: {
                users,
            },
        });   
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "User Updation Failed",
            status: "Error",
            error: err,
        });
    }
});

/*
Write a DELETE request to delete the user from the users.json
The response should be in the following format: 
{
    "status": "success",
    "data": {
        "users": [
            {
                "_id": 1,
                "name": "James A",
                "email": "jamesA@example.com"
            },
            {
                "_id": 2,
                "name": "James B",
                "email": "jamesb@example.com"
            }, .... // Shouldn't have the user deleted.
        ]
    }
}

Return a 404 error if the user is missing, with the following message 
{
    "message": "User not Found"
}
*/
app.delete("/api/v1/users/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let users = JSON.parse(fs.readFileSync("users.json"));
        let found = false;

        users = users.filter((user) => {
            if (user._id === id) {
                found = true;
                return false;
            } else {
                return true;
            }
        });

        if (!found) {
            res.status(404).json({
                message: "User not Found",
            });
            return;
        }

        fs.writeFileSync("users.json", JSON.stringify(users));

        res.status(200).json({
            status: "success",
            data: {
                users,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "User Deletion Failed",
            status: "Error",
            error: err,
        });
    }
});

module.exports = app;
