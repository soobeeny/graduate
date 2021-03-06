const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
//const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const upload = require('../../config/multer.js');

router.post('/register/truck', async(req, res, next) => {
    //사진이 maxcount이상 들어오면 500error 남 

    //array로 들어왔을 때, max만큼 안들어오면 오류나는지 test해보기 
    //field는 여러 name property로 받을 수 있고. 개수의 제한도 크게 x

    /*console.log("req.files: ",req.files);
    if(req.files != undefined){
        var photo1 =req.files[0].location;
        var photo2 = req.files[1].location;
    }*/
    //photo1,2는 내부적으로 넣어주는 이름이라 상관 x.
    //upload.array(image)로 받으니까 postman에서 보낼때는 사진 두개 다 이름을 image로 해서 보내기 

    //req.files.length로 접근. 사진 안들어오면 location에 접근 안되므로 
    //truck_idx , photo_idx있어야함. length에 따라서 row만들어야 malloc방식. 너무 static하면 안됨 

    var uid = req.body.uid;
    var category = req.body.category;
    var t_name = req.body.name;
    var tags = req.body.tags;
    var time = req.body.time;
    var menu = req.body.menu;
    var number = req.body.number;
    /*let searchUidQuery = 'SELECT uid FROM user WHERE name = ?';
    let searchUid = await db.queryParamCnt_Arr(searchUidQuery, [name]);
    searchUid=> 배열이옴 
    searchUid[0].uid 이렇게 넣어줘야함
    */

    let registerTruckInfoQuery = 'INSERT INTO truckInfo (t_category, t_name, user_uid,t_number) VALUES (?,?,?,?) ';
    let registerTruckInfo = await db.queryParamCnt_Arr(registerTruckInfoQuery, [category, t_name, uid, number]);

    //운영정보는 배열로 받아서 여기는 for문으로 돌려야할듯? 
    let insertWorkingInfoQuery = 'INSERT INTO workingInfo VALUES(?,?,?,?,?,?,?)';
    let insertMenuInfoQuery = 'INSERT INTO menu (tid,menu,price) VALUES (?,?,?)';
    let insertTagsQuery = 'INSERT INTO tag (tid,tagName) VALUES (?,?)';

    for (let i = 0; i < time.length; i++) {
        let lat = time[i].lat;
        let long = time[i].long;
        let location = time[i].location;
        let day = time[i].day;
        let start_time = time[i].start;
        let finish_time = time[i].finish;
        let insertWorkingInfo = await db.queryParamCnt_Arr(insertWorkingInfoQuery, [registerTruckInfo.insertId, lat, long, location, day, start_time, finish_time]);
    }
    for (let i = 0; i < menu.length; i++) {
        var menuName = menu[i].menuName;
        var price = menu[i].price;
        let insertMenuInfo = await db.queryParamCnt_Arr(insertMenuInfoQuery, [registerTruckInfo.insertId, menuName, price]);
    }

    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        if (tag !== "") {
            let insertTags = await db.queryParamCnt_Arr(insertTagsQuery, [registerTruckInfo.insertId, tag]);
        }
    }

    res.status(201).send({
        message: "success register truck"
    });

    if (registerTruckInfo === undefined)
        res.status(500).send({
            message: "Internal Server Error"
        }); //아예 서버 문제 await가 안됨

});

router.post('/register/truck/photo', upload.fields({ name: 'image', maxcount: 5 }), async(req, res, next) => {

    var tid = req.body.tid;
    var insertPhotoQuery = 'INSERT INTO truckPhoto (photo_tid, photo) VALUES (?,?)';
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i] == undefined) {}
            else { let insertPhoto = await db.queryParamCnt_Arr(insertPhotoQuery, [tid, req.files[i].location]); }
            console.log(insertPhoto);
        }
    }
    res.status(201).send({
        message: "Success Write TruckPhoto"
    });
});

router.post('/register/user', async(req, res, next) => {
    var id = req.body.id;
    var pwd = req.body.pwd;
    var name = req.body.name;
    var phone = req.body.phone;
    var status = req.body.status;

    const salt = await crypto.randomBytes(32);
    const hashedpwd = await crypto.pbkdf2(pwd, salt.toString('base64'), 100000, 32, 'sha512');

    let registerTruckQuery = 'INSERT INTO user (name,id,pwd,phone,salt,status) VALUES(?,?,?,?,?,?)';
    let registerTruck = await db.queryParamCnt_Arr(registerTruckQuery, [name, id, hashedpwd.toString('base64'), phone, salt.toString('base64'), status]);
    //트럭운영자의 status는 1, 일반사용자는 2

    if (registerTruck != undefined) {
        res.status(201).send({
            message: "Success register user",
            result: registerTruck.insertId
        });
    } else {
        res.status(400).send({
            messgae: "ID Already Exist"
        });
    }

});

router.get('/register/check', async(req, res, next) => {
    var id = req.query.id;
    let checkIDQuery = 'SELECT id FROM user WHERE id = ?';
    let checkID = await db.queryParamCnt_Arr(checkIDQuery, [id]);
    if (checkID.length === 0) {
        res.status(200).send({
            message: "No ID in DB"
        });
    } else {
        res.status(400).send({
            message: "ID Already Exist"
        });
    }
});

router.post('/login', async(req, res, next) => {
    var id = req.body.id;
    var pwd = req.body.pwd;
    var token = req.body.token;
    var getTid = null;
    let checkIdQuery = 'SELECT * FROM user WHERE id = ?';
    let checkResult = await db.queryParamCnt_Arr(checkIdQuery, [id]);

    if (checkResult.length === 1) {
        const salt = checkResult[0].salt;
        const hashedpwd = await crypto.pbkdf2(pwd, salt.toString('base64'), 100000, 32, 'sha512');
        if (hashedpwd.toString('base64') === checkResult[0].pwd) {
            if (checkResult[0].status === 1) {
                let getTidQuery = 'SELECT tid FROM truckInfo WHERE user_uid=? ';
                getTid = await db.queryParamCnt_Arr(getTidQuery, [checkResult[0].uid]);
            }
            res.status(201).send({
                message: "Success Login",
                result: checkResult[0].uid,
                status: checkResult[0].status,
                tid: getTid
            });
            let getTokenQuery = 'UPDATE user SET token = ? WHERE uid = ?';
            let getToken = await db.queryParamCnt_Arr(getTokenQuery, [token, checkResult[0].uid]);
        } else {
            res.status(400).send({
                message: "Failed Login"

            });
            console.log("Pwd Error");
        }
    } else {
        res.status(400).send({
            message: "Failed Login"
        });
        console.log("Id Error");
    }
});

module.exports = router;