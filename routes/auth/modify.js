const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const upload = require('../../config/multer');

router.put('/',async(req,res,next)=>{
	var name = req.body.name;
	var pwd = req.body.pwd;
	var uid = req.body.uid;

    const salt = await crypto.randomBytes(32);
    const hashedpwd = await crypto.pbkdf2(pwd, salt.toString('base64'), 100000, 32, 'sha512');

	let modifyQuery = 'UPDATE user SET name = ? , pwd = ? WHERE uid = ?';
	let modify = await db.queryParamCnt_Arr(modifyQuery,[name, hashedpwd.toString('base64'),uid]);

	if(modify != undefined){
		res.status(201).send({
			message : "Success to Modify"
		});
	}
	else {
		res.status(500).send({
			message : "Fail to Modify"
		});
	}

});

router.put('/truck',async(req,res,next)=>{
	var tid = req.body.tid;
	var category = req.body.category;
	var t_name = req.body.t_name;
	var t_lat = req.body.t_lat;
	var t_long = req.body.t_long;
	//var t_photo = req.body.t_photo;

//사진 수정 추가하기. 

	let modifyTruckInfoQuery = 'UPDATE truckInfo SET t_category = ?, t_name = ? , t_lat = ? ,t_long = ? WHERE tid =?';
	let modifyTruckInfo = await db.queryParamCnt_Arr(modifyTruckInfoQuery,[category, t_name, t_lat, t_long, tid]);
//postman에서 체크하고 값안넣는거랑 아예 안보내는거랑 둘다 undefined

	if(modifyTruckInfo.changedRows === 0 ){
		res.status(400).send({
			message : "same In DB"
		})
	}
	if(modifyTruckInfo != undefined){
		res.status(201).send({
			message : "Success to modify Truck Info"
		});
	}
	else {
		res.status(500).send({
			message : "Fail to modify Truck Info"
		});
	}
});

router.get('/truckinfo/:tid',async(req,res,next)=>{
	var tid = req.params.tid;

	let getTruckInfoQuery = 'SELECT * FROM truckInfo WHERE tid =? ';
	let truckInfo = await db.queryParamCnt_Arr(getTruckInfoQuery,[tid]);

	if(truckInfo != undefined){
		res.status(200).send({
			message : "Success to get Truck Info",
			result : truckInfo
		});
		
	}
	else {
		res.status(500).send({
			message : "Fail to get Truck Info"
		});
	}
});

module.exports = router;