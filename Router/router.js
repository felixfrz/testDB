
const conn = require("../db/conn");
const express = require("express");
const router = new express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const moment = require("moment");
const e = require("express");
const path = require("path");


// Files storage

var imgconfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads/");
    },
    filename: (req, file, callback) => {
        callback(null, `upload-${Date.now()}${path.extname(file.originalname)}`);
    }
});


const imageFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|avif)$/)) {
        return callback(new Error('Only Images files are allowed!'));
    }
    callback(null, true);
};

const pdfFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(pdf)$/)) {
        return callback(new Error('Only PDF files are allowed!'));
    }
    callback(null, true);
};

const audioFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(mp3|wav|aac)$/)) {
        return callback(new Error('Only Audio files are allowed!'));
    }
    callback(null, true);
};

const videoFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(mp4|mkv|flv)$/)) {
        return callback(new Error('Only Video files are allowed!'));
    }
    callback(null, true);
};



const upload = multer({
    storage: imgconfig,
    fileFilter: (req, file, callback) => {
        switch (file.fieldname) {
            case 'compfile1':
                imageFilter(req, file, callback);
                break;
            case 'compfile2':
                pdfFilter(req, file, callback);
                break;
            case 'compfile3':
                audioFilter(req, file, callback);
                break;
            case 'compfile4':
                videoFilter(req, file, callback);
                break;
            default:
                callback(new Error('Invalid field name'));
        }
    }
});


Multiple = upload.fields([{ name: 'compfile1' }, { name: 'compfile2' }, { name: 'compfile3' }, { name: 'compfile4' }]);

// File Complaint

router.post("/addcomplaint", Multiple, (req, res) => {


    const files = Object.values(req.files);

    let compfile1 = "NA";
    let compfile2 = "NA";
    let compfile3 = "NA";
    let compfile4 = "NA";

    if (files.length > 0 && files[0].length > 0) {
        compfile1 = files[0][0].filename;
    }
    if (files.length > 1 && files[1].length > 0) {
        compfile2 = files[1][0].filename;
    }
    if (files.length > 2 && files[2].length > 0) {
        compfile3 = files[2][0].filename;
    }
    if (files.length > 3 && files[3].length > 0) {
        compfile4 = files[3][0].filename;
    }

    const { username, userphone, useremail, department, address, message, userid, compid } = req.body;

    conn.query("INSERT INTO complains SET ?", { compfile1, compfile2, compfile3, compfile4, username, userphone, useremail, department, address, message, userid, compid }, (err, result) => {

        if (err) {
            return res.status(400).json({ error: err.message });
        }
        else {
            res.status(201).json({ status: 201, data: req.body })
        }

    });

});


// Show Complaints

router.get("/getcomplains", (req, res) => {


    conn.query("SELECT * FROM complains ORDER BY id DESC ", (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// get single Complaint

router.get("/singlecomp/:id", (req, res) => {

    const { id } = req.params;

    conn.query("SELECT * FROM complains WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});


// Response Comp 

router.patch("/response/:id", (req, res) => {

    const { id } = req.params;

    const { respmsg } = req.body;

    conn.query("UPDATE complains SET response = ? WHERE id = ? ", [respmsg, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "Error" });
        } else {
            res.status(201).json(result);
        }
    })
});



// Register User

router.post("/register", (req, res) => {

    const { fname, lname, uphone, uemail, upassword, cpassword, department } = req.body;

    try {
        conn.query("SELECT * FROM users WHERE uemail = ?", uemail, (err, result) => {
            if (result.length) {
                res.status(422).json("Email is already exist")
            }
            else {
                conn.query("INSERT INTO users SET ?", { fname, lname, uphone, uemail, upassword, cpassword, department }, (err, result) => {
                    if (err) {
                        console.log("err" + err);
                    }
                    else {
                        res.status(201).json(req.body);
                    }
                })
            }
        })
    } catch (error) {
        res.status(422).json("error");
    }

});


// Login User

router.post('/login', (req, res) => {

    const uemail = req.body.uemail;
    const upassword = req.body.upassword;

    conn.query("SELECT * FROM users WHERE ustatus = 'active' AND uemail = ? AND upassword = ?", [uemail, upassword], (err, result) => {

        if (err) {
            res.send({ err: err });
            console.log(err);
        }

        if (result.length > 0) {
            req.session.user = result;
            res.send(result);
        } else {
            res.send({ message: "Invalid Credentials" });
        }

    });
});


// Contact Us

router.post("/contactus", (req, res) => {

    const { cname, cemail, csubject, cmessage } = req.body;

    conn.query("INSERT INTO queries SET ?", { cname, cemail, csubject, cmessage }, (err, result) => {
        if (err) {
            res.status(422).json("error");
            console.log(err);
        }
        else {
            res.status(201).json(req.body);
        }
    });

});


// get single user

router.get("/singleuser/:id", (req, res) => {

    const { id } = req.params;

    conn.query("SELECT * FROM users WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});

router.delete("/deleteuser/:id", (req, res) => {

    const { id } = req.params;

    conn.query(`DELETE FROM users WHERE id ='${id}'`, (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});

// update User 

router.patch("/update/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE users SET ? WHERE id = ? ", [data, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "Error" });
        } else {
            res.status(201).json(result);
        }
    })
});


//Get All Users Data

router.get("/getuserdata", (req, res) => {

    conn.query("SELECT * FROM users ORDER BY id DESC", (err, result) => {
        if (err) {
            res.status(422).json("No data available");
        }
        else {
            res.status(201).json(result);
        }
    })

});




//Change Status API
router.post("/changestatus/:id", (req, res) => {

    const { status } = req.body;
    const { id } = req.params;

    conn.query("UPDATE users SET ustatus = ? WHERE id = ? ", [status, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "error" });
            console.log(err)
        } else {
            res.status(201).json(result);
        }
    })
});


// Add Department

router.post("/adddepartment", upload.single("compfile1"), (req, res) => {

    const { filename } = req.file;
    const { title } = req.body;
    const { detail } = req.body;

    try {

        conn.query("INSERT INTO departs SET ?", { image: filename, title: title, detail: detail }, (err, result) => {

            if (err) {
                console.log("Error");
            }
            else {
                res.status(201).json({ status: 201, data: req.body })
            }

        })

    } catch (error) {
        res.status(422).json({ status: 422, error })
    }

});


// SHow Departments

router.get("/getdepartment", (req, res) => {


    conn.query("SELECT * FROM departs ORDER BY id DESC ", (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// Department delete api

router.delete("/deletedept/:id", (req, res) => {

    const { id } = req.params;

    conn.query(`DELETE FROM departs WHERE id ='${id}'`, (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// Show Queries

router.get("/getqueries", (req, res) => {

    conn.query("SELECT * FROM queries ORDER BY id DESC ", (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// Query delete api

router.delete("/deletequery/:id", (req, res) => {

    const { id } = req.params;

    conn.query(`DELETE FROM queries WHERE id ='${id}'`, (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// Member Data

router.post("/addmember", (req, res) => {

    const { mname, memail } = req.body;

    conn.query("INSERT INTO members SET ?", { mname, memail }, (err, result) => {
        if (err) {
            console.log("err" + err);
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    });

});


// Show Members

router.get("/getmembers", (req, res) => {


    conn.query("SELECT * FROM members ORDER BY id DESC ", (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});


// Member delete api

router.delete("/deletemember/:id", (req, res) => {

    const { id } = req.params;

    conn.query(`DELETE FROM members WHERE id ='${id}'`, (err, result) => {
        if (err) {
            console.log("Error");
        }
        else {
            res.status(201).json({ status: 201, data: result })
        }
    })
});





module.exports = router;
