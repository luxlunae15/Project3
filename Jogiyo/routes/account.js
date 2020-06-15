var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'jogiyo'
});

/* GET users listing. */
router.get('/', function(req,res,next){
	res.redirect('/account/userlist/1');
})

router.get('/userlist', function(req,res,next){
	res.redirect('/account/userlist/1');
})

router.get('/userlist/:page', function(req, res, next) {
	pool.getConnection(function(err, connection){
		connection.query("SELECT * FROM user", function(err, rows){
			if(err) console.error("err : "+err);
			res.render('account', {title:'회원 관리', rows:rows});
			connection.release();
		});
	});
});

router.get('/info/:id', function(req, res, next){
	var id = req.params.id;

	pool.getConnection(function(err,connection){
		connection.query("SELECT * FROM user WHERE ID=?",[id],function(err,rows){
			if(err) {
				console.error("err: "+err);
			}
			else
			{
				res.render('info', {title:"회원 정보 조회", rows:rows[0]});
			}
			connection.release();
		});
	});
});

router.get('/update', function(req, res, next){
	var id = req.query.id;

	pool.getConnection(function(err,connection){
		if(err) console.error("커넥션 객체 얻어오기 에러 : ", err);

		var sql = "SELECT * FROM user WHERE ID=?";
		connection.query(sql, [id], function(err, rows){
			if(err) console.error(err);
			res.render('user_update', {title:"회원 정보 수정", row:rows[0]});
			connection.release();
		});
	});
});

router.post('/update', function(req, res, next){
	var id = req.body.id;
	var passwd = req.body.passwd;
	var name = req.body.name;
	var tel = req.body.tel;
	var datas = [passwd, name, tel, id];

	pool.getConnection(function(err, connection){
		var sql = "UPDATE user SET PASSWD=?, NAME=?, PHONE=? WHERE ID=?";
		connection.query(sql, datas, function(err, result){
			if(err) {
				console.error("회원 정보 수정 중 에러 발생 err : ",err);
			}
			else
			{
				if(result.affectedRows == 0)
				{
					res.send("<script>alert('회원 정보 수정에 실패하였습니다.');history.back();</script>");
				}
				else
				{
					res.send('<script>alert("회원 정보가 수정되었습니다.");location.href="/account";</script>');
				}
			}
			connection.release();
		});
	});
});

router.get('/delete', function(req, res, next){
	var id = req.query.id;

	pool.getConnection(function(err,connection){
		if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

		var sql = "DELETE FROM user WHERE id=?";
		connection.query(sql, [id], function(err, rows){
			if(err) console.log("err : " + err);
			else
			{
				res.send('<script>alert("회원이 삭제되었습니다.");location.href="/account";</script>');
			}
			connection.release();
		})
	})
})

module.exports = router;
