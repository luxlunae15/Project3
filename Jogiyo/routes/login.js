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
	res.render('login', { title: 'Login!'});
});

router.post('/', function(req, res, next){
	var id = req.body.id;
	var passwd = req.body.passwd;

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM "+req.body.auth+" WHERE ID=?";
		connection.query(sql, [id], function(err, results, fields){
			if(err) {
				console.error("err: "+err);
				res.send('<script type="text/javascript">alert("로그인 실패");location.href="/login";</script>');
			}
			else
			{
				if(results.length>0)
				{
					if(passwd == results[0].PASSWD)
					{
						if(req.body.auth == 'seller')
							res.send('<script type="text/javascript">alert("로그인 되었습니다.");location.href="/seller";</script>');
						else
							res.send('<script type="text/javascript">alert("로그인 되었습니다.");location.href="/";</script>');
					}
					else
					{
						res.send('<script type="text/javascript">alert("비밀번호를 확인해주세요.");location.href="/login";</script>');
					}
				}
				else
				{
					res.send('<script type="text/javascript">alert("아이디를 확인해주세요.");location.href="/login";</script>');
				}
			}
			connection.release();
		});
	});
});

module.exports = router;