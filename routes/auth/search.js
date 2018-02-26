const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
//const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

router.post('/id',async(req,res,next)=>{
	var name = req.body.name;
	var phone = req.body.phone;
	//get방식으로 quetyString방식으로 이름(한글)받으면 깨져서 post로 바꿈.

	let searchIdQuery = 'SELECT id FROM user WHERE name = ? AND phone = ?';
	let searchId = await db.queryParamCnt_Arr(searchIdQuery,[name,phone]);
	if(searchId.length === 1){
		res.status(201).send({
			message : "Success Find Your Id",
			data : searchId[0].id
		});
	}
	else{
		res.status(400).send({
			message : "Fail to find id"
		});
	}
});

router.post('/pwd',async(req,res,next)=>{
	var id = req.body.id;
	var name = req.body.name;
	var phone = req.body.phone;
//임의의 비밀번호 값 주거나, 라우트 하나 더 파거나 

	let searchPwdQuery = 'SELECT * FROM user WHERE id = ? AND name = ? AND phone = ?';
	let searchPwd = await db.queryParamCnt_Arr(searchPwdQuery,[id,name,phone]);

	if(searchPwd.length === 1){
		res.status(201).send({
			message  : "Success Find Your Pwd"
		});
	}
	else {
		res.status(400).send({
			message : "Not In DB"
		});
	}
});
//클라에서 이 id값 넘겨줘야함 

router.post('/setpwd',async(req,res,next)=>{
	var id = req.body.id;
	var pwd = req.body.pwd;

	let getSaltQuery = 'SELECT salt FROM user WHERE id = ?';
	let getSalt = await db.queryParamCnt_Arr(getSaltQuery,[id]);
	salt = getSalt[0].salt;

    const hashedpwd = await crypto.pbkdf2(pwd, salt.toString('base64'), 100000, 32, 'sha512');

	let setPwdQuery = 'UPDATE user SET pwd = ? WHERE id = ?';
	let setPwd = await db.queryParamCnt_Arr(setPwdQuery,[hashedpwd.toString('base64'),id]);
	
	if(setPwd.changedRows === 1){
		res.status(201).send({
			message : "Success Change Pwd"
		});
	}
	else {
		res.status(400).send({
			message : "Same Pwd"
		});
	}
});

module.exports = router;