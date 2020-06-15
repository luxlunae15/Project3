var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'localhost',
	user: 'YeChanSong',
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
	var datas = [id, passwd, name];

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO "+req.body.auth+"(ID, PASSWD, NAME) values(?,?,?)";

		connection.query(sql, datas, function(err,rows){
			if(err) console.error("err: "+err);
			console.log("회원가입 완료");
			console.log("rows : " + JSON.stringify(rows));

			res.send('<script type="text/javascript">alert("회원가입이 완료되었습니다.");location.href="/login";</script>');
			connection.release();
		});
	});
});

module.exports = router;