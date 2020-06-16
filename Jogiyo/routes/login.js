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
// router.get('/', function(req, res, next) {
// 	res.render('login', { title: 'Login!'});
// });

// router.post('/', function(req, res, next){
// 	var id = req.body.id;
// 	var passwd = req.body.passwd;

// 	pool.getConnection(function(err, connection){
// 		var sql = "SELECT * FROM user WHERE ID=?";
// 		connection.query(sql, [id], function(err, results, fields){
// 			if(err) {
// 				console.error("err: "+err);
// 				res.send('<script type="text/javascript">alert("로그인 실패");location.href="/login";</script>');
// 			}
// 			else
// 			{
// 				if(results.length>0)
// 				{
// 					if(passwd == results[0].PASSWD)
// 					{
// 						res.send('<script type="text/javascript">alert("로그인 되었습니다.");location.href="/";</script>');
// 					}
// 					else
// 					{
// 						res.send('<script type="text/javascript">alert("비밀번호를 확인해주세요.");location.href="/login";</script>');
// 					}
// 				}
// 				else
// 				{
// 					res.send('<script type="text/javascript">alert("아이디를 확인해주세요.");location.href="/login";</script>');
// 				}
// 			}
// 			connection.release();
// 		});
// 	});
// });

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


router.use(session({
	secret: 'testcode',
	cookie: {maxAge: 60*60*1000},
	resave: true,
	saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

/* GET 로그인 */
router.get('/', function(req, res, next) {

    if (req.user == undefined)
        var login = 'unlogin';
    else {
        var login = 'login';
        res.redirect('/');
    }
    res.render('login', { title: 'login'});
});

/* POST 로그인 */
router.post('/', passport.authenticate('local', {successRedirect : '/', failureRedirect: '/login', failureFlash: true }), function(req, res) {
    if (req.user != undefined) {
        res.redirect('/');
    }
    res.redirect('/login');
})

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

var isAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/');
};

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'passwd',
    passReqToCallback: true
}, function(req, id, passwd, done) {
    pool.getConnection(function(err, connection) {
        if (err) return res.sendStatus(400);

        var sql = "SELECT * FROM user WHERE ID = ?";

        connection.query(sql, [id], function(err, result) {
            if (err) {
                console.log('err :' + err);
                return done(false, null);
            } else {
                if (result.length === 0) {
                    console.log('해당 유저가 없습니다');
                    return done(false, null);
                } else {
                    if (passwd != result[0].PASSWD) {
                        console.log('패스워드가 일치하지 않습니다');
                        return done(false, null);
                    } else {
                        var user = result[0];
                        console.log('로그인 성공');
                        return done(null, user);
                    }
                }
            }
        });
    });
}));

module.exports = router;
