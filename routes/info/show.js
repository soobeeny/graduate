const express = require('express');
const router = express.Router();

//const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const moment = require('moment');

router.get('/detail/:tid', async(req, res, next) => {
    var tid = req.params.tid;

    let showDetailQuery = 'SELECT t_name, day,location,menu,price FROM truckInfo, workingInfo,menu WHERE truckInfo.tid = ?'
    //let showDetailQuery = 'SELECT * FROM truckInfo WHERE tid = ?';
    let showDetail = await db.queryParamCnt_Arr(showDetailQuery, [tid]);

    res.status(200).send({
        message: "Success Show Truck Detail",
        result: showDetail
    });
});

router.get('/detailPhoto/:tid', async(req, res, next) => {
    var tid = req.params.tid;

    let showDetailPhotoQuery = 'SELECT * FROM truckPhoto WHERE tid = ?';
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

/*router.get('/recommend', async(req, res, next) => {

    var uid = req.query.uid;

    let getUserHistoryQuery = 'SELECT * FROM history WHERE uid = ?';
    let getUserHistory = await db.queryParamCnt_Arr(getUserHistoryQuery, [uid]);

    console.log(getUserHistory);

    var temp = [];
    temp.push(getUserHistory[0].his0, getUserHistory[0].his1, getUserHistory[0].his2, getUserHistory[0].his3, getUserHistory[0].his4, getUserHistory[0].his5, getUserHistory[0].his6, getUserHistory[0].his7, getUserHistory[0].his8, getUserHistory[0].his9); //array

    var categorys = [0, 0, 0, 0, 0, 0, 0, 0]; //배열 생성 

    for (let i = 0; i < temp.length; i++) {
        switch (temp[i]) {
            case temp[i] === "fish":
                category[0]++;
                break;
            case temp[i] === "waffle":
                category[1]++;
                break;
            case temp[i] === "takoyaki":
                category[2]++;
                break;
            case temp[i] === "kebab":
                category[3]++;
                break;
            case temp[i] === "tteok":
                category[4]++;
                break;
            case temp[i] === "soon":
                category[5]++;
                break;
            case temp[i] === "turkey":
                category[6]++;
                break;
            case temp[i] === "gob":
                category[7]++;
                break;
            default:
                break;
        }
    }

    let max = -1;
    let index = -1;

    for (let i = 0; i < category.length; i++) {
        if (categorys[i] > max) {
            max = category[i];
            index = i;
        }
    }

    //let selectRecommendCategoryQuery = 'SELECT ';
    //해당 카테고리 트럭만 보이도록 select. 

    res.status(200).send({
        message: "Suceess Show Recommend Category",
        result:
    });

});
*/

router.get('/recommend', async(req, res, next) => {

});

router.get('/:category/:lat/:long/:distance', async(req, res, next) => {
    var category = req.params.category;
    //user의 현재 위치
    var currentlat = req.params.lat;
    var currentlong = req.params.long;
    var distance = req.params.distance;
    
    //모든 트럭의 lat,long을 가지고 와야함 
    //var lat = req.params.lat;
    //var long =req.params.long;

    var day = moment().format('dddd'); //day of week

    var showCategoryQuery;
    var array = [];

    if (category === "all") { //주변트럭 탭에서는 카테고리 상관없이 보여줘야함. 

        showCategoryQuery = `SELECT *, (6371*acos(cos(radians(?))*cos(radians(workingInfo.lat))*cos(radians(workingInfo.long) -radians(?))
    +sin(radians(?))*sin(radians(workingInfo.lat)))) AS distance FROM truckInfo, workingInfo HAVING distance <= `+(distance/1000)+` ORDER BY distance LIMIT 0,1000`;
        //where  workingInfo.day = ? 

        array = [currentlat, currentlong, currentlat, day];


    } else {

        showCategoryQuery = `SELECT *, (6371*acos(cos(radians(?))*cos(radians(workingInfo.lat))*cos(radians(workingInfo.long) -radians(?))
    +sin(radians(?))*sin(radians(workingInfo.lat)))) AS distance FROM truckInfo, workingInfo WHERE truckInfo.t_category = ? HAVING distance <= 1 ORDER BY distance LIMIT 0,1000`;
        //AND workingInfo.day = ? 

        array = [currentlat, currentlong, currentlat, category, day];

    }

    var showCategory = await db.queryParamCnt_Arr(showCategoryQuery, array);


    /* for (let i = 0; i < showCategory.length; i++) {
         let getTagsQuery = 'SELCET * FROM tag WHERE tid = ?';
         let getTags = await db.queryParamCnt_Arr(getTagsQuery, [showCategory[i].tid]); // => 제이슨 객체를 담은 배열로 옴 . 태그 하나당 배열로 옴. tid를 빼고 tagName만 잘 넘겨줘야함 

         let tagNames = [];
         for (let j = 0; j < getTags.length; j++) {
             tagNames.push(getTags[j].tagName);
         }

         showCategory[i].tags = tagNames; //제이슨의 property를 추가시켜서 보여주기 위해 
     }*/
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