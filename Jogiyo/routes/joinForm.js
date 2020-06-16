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
router.get('/', function(req, res, next) {
	res.render('joinForm', { title: 'Join Form!'});
});

router.post('/', function(req, res, next){
	var id = req.body.id;
	var passwd = req.body.passwd;
	var name = req.body.name;
	var auth = req.body.auth;
	var phone = req.body.tel;
	var datas = [id, passwd, name, auth, phone];

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO user(ID, PASSWD, NAME, AUTH, PHONE) values(?,?,?,?,?)";

		connection.query(sql, datas, function(err,rows){
			if(err){
				console.error("err: "+err);
				res.send('<script type="text/javascript">alert("회원가입에 실패하였습니다.");location.href="/join";</script>');
			}
			else
			{
				console.log("회원가입 완료");
				console.log("rows : " + JSON.stringify(rows));

				res.send('<script type="text/javascript">alert("회원가입이 완료되었습니다.");location.href="/login";</script>');
			}
			connection.release();
		});
	});
});

module.exports = router;
