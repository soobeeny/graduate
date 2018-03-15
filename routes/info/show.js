const express = require('express');
const router = express.Router();

//const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const moment = require('moment');

router.get('/detail/:tid', async(req, res, next) => {
    var tid = req.params.tid;

    let showTruckNameQuery = 'SELECT t_name FROM truckInfo WHERE tid = ?';
    let showTruckName = await db.queryParamCnt_Arr(showTruckNameQuery,[tid]);
  
    let showDetailLocationQuery = 'SELECT day,location FROM workingInfo WHERE workingInfo.info_tid = ? ';
    let showDetailLocation = await db.queryParamCnt_Arr(showDetailLocationQuery, [tid]);
  
    let showMenuQuery = 'SELECT menu,price FROM menu WHERE menu.tid = ?'
    let showMenu = await db.queryParamCnt_Arr(showMenuQuery,[tid])
    res.status(200).send({
        message: "Success Show Truck Detail",
        name: showTruckName,
        location: showDetailLocation,
        menu: showMenu
    });
});

router.get('/detailPhoto/:tid', async(req, res, next) => {
    var tid = req.params.tid;

   let showDetailPhotoQuery = 'SELECT * FROM truckPhoto WHERE photo_tid = ?';
    let showDetailPhoto = await db.queryParamCnt_Arr(showDetailPhotoQuery, [tid]);


    if (showDetailPhoto != undefined) {
        res.status(200).send({
            message: "Success show TruckPhoto",
            result: showDetailPhoto
        });
    }
});
router.get('/review/:tid', async(req, res, next) => {
    var tid = req.params.tid;

    let showReviewQuery = 'SELECT review.*,user.id FROM review,user WHERE truckInfo_tid = ? AND review.user_uid = user.uid';
    let showReview = await db.queryParamCnt_Arr(showReviewQuery, [tid]);

    res.status(200).send({
        message: "Success show Review",
        result: showReview
    });
});

router.get('/comment/:rid', async(req, res, next) => {
    var rid = req.params.rid;

    let showCommentQuery = 'SELECT comment.* , user.id FROM comment,user WHERE rid = ? AND comment.uid = user.uid';
    let showComment = await db.queryParamCnt_Arr(showCommentQuery, [rid]);

    res.status(200).send({
        message: "Success show Comment",
        result: showComment
    });
});
router.get('/like/:uid', async(req, res, next) => {
    var uid = req.params.uid;

    let showLikeQuery = 'SELECT * FROM truckInfo WHERE tid IN(SELECT tid FROM likely WHERE uid = ?)';
    let showLike = await db.queryParamCnt_Arr(showLikeQuery, [uid])

    res.status(200).send({
        message: "Success show LikeList",
        result: showLike
    });
});

router.get('/notice', async(req, res, next) => {
    var tid = req.query.tid;
    //흠 최신의 공지만 띄워줄건데 어떻게 하지? 

    let showNoticeQuery = 'SELECT content,time FROM notice WHERE tid = ? ';
    let showNotice = await db.queryParamCnt_Arr(showNoticeQuery,[tid]);

    if(showNotice){
        res.status(200).send({
            message : "Success Show Notice",
            result : showNotice
        });
    }
    else {
        res.status(500).send({
            message : "Fail to Show Notice"
        });
    }

});

router.get('/promotion',async(req,res,next)=>{
    //흠.. 기준을 정해서 where문 추가하기 

    let showPromotionQuery = 'SELECT * FROM promotion';
    let showPromotion = await db.queryParamCnt_None(showPromotionQuery);

    if(showPromotion!=undefined){
        res.status(200).send({
            message:"Success Show Promotion",
            result : showPromotion
        });
    }

});

router.get('/:category/:lat/:long/:distance', async(req, res, next) => {
    var category = req.params.category;
    //user의 현재 위치
    var currentlat = req.params.lat;
    var currentlong = req.params.long;
    var distance = req.params.distance;
    
    //모든 트럭의 lat,long은 디비에 있으니까! 

    var day = moment().format('dddd'); //day of week

    var showCategoryQuery;
    var array = [];

    if (category === "all") { //주변트럭 탭에서는 카테고리 상관없이 보여줘야함. 

        showCategoryQuery = `SELECT *, (6371*acos(cos(radians(?))*cos(radians(workingInfo.lat))*cos(radians(workingInfo.long) -radians(?))
    +sin(radians(?))*sin(radians(workingInfo.lat)))) AS distance FROM truckInfo, workingInfo WHERE workingInfo.day = ? 
    AND truckInfo.tid = workingInfo.info_tid  HAVING distance <= `+(distance/1000)+` ORDER BY distance LIMIT 0,1000`;
        //where  workingInfo.day = ? 

        array = [currentlat, currentlong, currentlat,day];


    } else {

        showCategoryQuery = `SELECT *, (6371*acos(cos(radians(?))*cos(radians(workingInfo.lat))*cos(radians(workingInfo.long) -radians(?))
    +sin(radians(?))*sin(radians(workingInfo.lat)))) AS distance FROM truckInfo, workingInfo WHERE truckInfo.t_category = ?
     AND workingInfo.day= ? AND truckInfo.tid = workingInfo.info_tid HAVING distance <= 1 ORDER BY distance LIMIT 0,1000`;
        //AND workingInfo.day = ? 

        array = [currentlat, currentlong, currentlat, category,day];

    }

    var showCategory = await db.queryParamCnt_Arr(showCategoryQuery, array);

    if (showCategory != undefined) {
        res.status(200).send({
            message: "Success Show Truck",
            result: showCategory
        });
    } else {
        res.status(500).send({
            message: "Fail Show Truck "
        });
    }
});

module.exports = router;