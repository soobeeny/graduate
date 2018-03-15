const express = require('express');
const router = express.Router();

//const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const upload = require('../../config/multer.js');
const moment = require('moment');
// FCM
const FCM = require('fcm-node');
const serverKey = require('../../config/serverKey').key;
const fcm = new FCM(serverKey);

router.post('/review', async(req, res, next) => {

    var uid = req.body.uid;
    var tid = req.body.tid;
    var content = req.body.content;
    var time = moment().format("YYYY-MM-DD HH:mm");

    let writeReviewQuery = 'INSERT INTO review (review_content,user_uid,truckInfo_tid,write_time) VALUES(?,?,?,?)';
    let writeReview = await db.queryParamCnt_Arr(writeReviewQuery, [content, uid, tid, time]);
    
    if (writeReview != undefined) {
        res.status(201).send({
            message: "Success Write Review",
            rid : writeReview.insertId
        });
    } else {
        res.status(500).send({
            message: "Internal Server Error"
        });
    }

});

router.post('/reviewPhoto',upload.single('image'),async(req,res,next)=>{
    var rid = req.body.rid;

    var photo = null;
    if (req.file != undefined) {
        photo = req.file.location;
    }

    let writeReviewPhotoQuery= 'UPDATE review SET photo = ? WHERE rid = ?';
    let writeReviewPhoto = await db.queryParamCnt_Arr(writeReviewPhotoQuery,[photo,rid]);

    res.status(201).send({
        message :"Success Write Photo"
    });
});

router.post('/comment', async(req, res, next) => {

    var uid = req.body.uid;
    var rid = req.body.rid;
    var content = req.body.content;
    var time = moment().format("YYYY-MM-DD HH:mm");
    let writeCommentQuery = 'INSERT INTO comment VALUES (?,?,?,?)';
    let writeComment = await db.queryParamCnt_Arr(writeCommentQuery, [content, rid, uid, time]);
    if (writeComment != undefined) {
        res.status(201).send({
            message: "Success Write Comment"
        });
    } else {
        res.status(500).send({
            message: "Fail to Write Comment"
        });
    }

});
router.post('/like', async(req, res, next) => {
    var uid = req.body.uid;
    var tid = req.body.tid;

    let setLikeQuery = 'INSERT INTO likely VALUES (?,?)'
    let setLike = await db.queryParamCnt_Arr(setLikeQuery, [uid, tid]);

    // uid,tid쌍이 프라이머리키일때는 똑같은값이 들어가면 undefined가 뜸. 
    // 프라이머리 키로 안잡아놓으면 같은 값을 넣어도 affectedRows가 1이라서 구분 x

    /*if(setLike === undefined){
        res.status(500).send({
            message : "internal server error"
        }); 
    }*/
    if (setLike != undefined) {
        res.status(201).send({
            message: "Success Set Like",
        });
    }
});

router.post('/recommend', async(req, res, next) => { //안쓰는거 
    var uid = req.body.uid;
    var category = req.body.category;

    let getHistoryIdQuery = 'SELECT historyId FROM user WHERE uid = ?;' //현재 히스토리 인덱스 가져오기
    let getHistoryId = await db.queryParamCnt_Arr(getHistoryIdQuery, [uid]);

    var updateHistoryIdQuery;
    if (getHistoryId[0].historyId === 9) {
        updateHistoryIdQuery = 'UPDATE user SET historyId = 0 where uid = ?'
    } else {
        updateHistoryIdQuery = 'UPDATE user SET historyId = historyId+1 where uid =?';
    }

    let updateHistoryId = await db.queryParamCnt_Arr(updateHistoryIdQuery, [uid]);

    let saveHistoryQuery = 'UPDATE history SET his' + getHistoryId[0].historyId + ' = ? where uid = ?';
    let saveHistory = await db.queryParamCnt_Arr(saveHistoryQuery, [category, uid]);

    console.log(saveHistory);

    res.status(201).send({
        message: "Success Save History"
    });
});

router.post('/notice', async(req, res, next) => {

    var tid = req.body.tid;
    var content = req.body.content;
    var time = moment().format("YYYY-MM-DD HH:mm");

    let writeNoticeQuery = 'INSERT INTO notice (tid,content,time) VALUES (?,?,?)';
    let writeNotice = await db.queryParamCnt_Arr(writeNoticeQuery, [tid, content, time])

    let getLikeUsersQuery = ' SELECT token FROM user WHERE uid IN (SELECT uid FROM likely WHERE tid = ?) ';
    let getLikeUsers = await db.queryParamCnt_Arr(getLikeUsersQuery, [tid]);

    let getTruckNameQuery = 'SELECT t_name FROM truckInfo WHERE tid = ?'
    let getTruckName = await db.queryParamCnt_Arr(getTruckNameQuery, [tid]);


    for (let i = 0; i < getLikeUsers.length; i++) {

        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: getLikeUsers[i].token,
            notification: {
                title: '트럭의 민족', //제목
                body: getTruckName[0].t_name + '의 공지가 생성되었습니다.' //보낼메시지
            },
        };

        fcm.send(message, function(err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
                res.status(500).send({
                    message: "Internal Server Error"
                });
            } else {
                console.log("Successfully sent with response: ", response);
                res.status(201).send({
                    message: "Success to Send Message"
                });
            }
        }); //fcm.send
    }
});

router.post('/promotion',upload.single('image'),async(req,res,next)=>{
    var tid = req.body.tid;
    var title = req.body.title;
    var content = req.body.content;
    var time = moment().add(9,'hour').format("YYYY-MM-DD HH:mm");
    var photo = null;
    if(req.file != undefined){
        photo = req.file.location;
    }
    let writePromotionQuery = 'INSERT INTO promotion (tid,title,content,time,photo) VALUES (?,?,?,?,?)';
    let writePromotion = await db.queryParamCnt_Arr(writePromotionQuery,[tid,title,content,time,photo]);

    if(writePromotion!=undefined){
        res.status(201).send({
            message : "Success Write Promotion"
        });
    }
    else {
        res.status(500).send({
            message : "Fail to write Promotion"
        });
    }
})


module.exports = router;