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

var multiconnection = mysql.createConnection({                                                               
    host: 'localhost',
    user: 'root',
	password: '1234',
	database: 'jogiyo',
    multipleStatements: true
  })
  multiconnection.connect();

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
    	return next();
    res.redirect('/login');
};


router.use(session({
	secret: 'testcode',
	cookie: {maxAge: 60*60*1000},
	resave: true,
	saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

/* GET 로그인 */
router.get('/login', function(req, res, next) {

    if (req.user == undefined)
        var login = 'unlogin';
    else {
        var login = 'login';
        res.redirect('/');
    }
    res.render('login', { title: 'login'});
});

/* POST 로그인 */
router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
})

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

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


router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.user);
    if (req.user == undefined)
        var login = 'unlogin';
    else {
        var login = 'login';
    }
	res.render('index', { title: 'Express', login:login });
});


router.get('/joinForm', function(req, res, next) {
	res.render('joinForm', { title: 'Join Form!'});
});

router.post('/joinForm', function(req, res, next){
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


router.get('/account', function(req,res,next){
	res.redirect('/account/userlist/1');
})

router.get('/account/userlist', function(req,res,next){
	res.redirect('/account/userlist/1');
})

router.get('/account/userlist/:page', function(req, res, next) {
	var page = req.params.page;
	pool.getConnection(function(err, connection){
		connection.query("SELECT * FROM user", function(err, rows){
			if(err) console.error("err : "+err);
			res.render('account', {title:'회원 관리', rows:rows, page:page, page_num:10});
			connection.release();
		});
	});
});

router.get('/account/info/:id', function(req, res, next){
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

router.get('/account/update', function(req, res, next){
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

router.post('/account/update', function(req, res, next){
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

router.get('/account/delete', function(req, res, next){
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
		});
	});
});


//////////////////////////////// 종학 부분 끝 /////////////////////////////////////////////////////

/////////////////////////////// 현식 부분 시작 ////////////////////////////////////////////////////

router.get('/buyer', function(req,res,next){
    res.render('buyer', {title: "구매자"});
});

router.get('/buyer/print-menu', function(req,res,next){
    var sql = "select * from menu";
    console.log("print-menu : ");
    pool.getConnection(function(err, connection){
        connection.query(sql, function(err,row){
            if(err) console.error(err);
            console.log("메뉴 출력 결과: ",row);
            res.render('print-menu', {title: "메뉴 조회", rows:row});
            connection.release();
        });
        
    });
});

router.get('/buyer/cart/:menuID', function(req,res,next){
    var menuID = req.params.menuID;
    res.render('cart',{title: "장바구니", menuID:menuID});
    console.log(menuID);
});

router.post('/buyer/add-cart/:menuID', function(req, res, next){
    var menuID = req.params.menuID;
    console.log(menuID);
    console.log(req.body.userID);
    var datas = [req.body.userID, menuID];
    pool.getConnection(function(err, connection){
		var sql = "insert into user_menu (user_ID, menu_ID) values(?, ?)"
		connection.query(sql, datas, function(err,rows){
			if(err) console.error("err: "+err);
			console.log("장바구니추가 완료");
			console.log("rows : " + JSON.stringify(rows));
            res.redirect('/buyer');
			connection.release();
		});
	});
});

router.get('/buyer/delete-cart/:userID/:menuID', function(req,res,next){
    var userID = req.params.userID;
    var menuID = req.params.menuID;
    var datas = [userID, menuID];
    console.log(userID, menuID);
    var sql = "delete from user_menu where user_ID = ? and menu_ID = ?";
    console.log(sql);
    pool.getConnection(function(err, connection){		
		connection.query(sql, datas, function(err,row){
            console.log(sql);
			if(err) console.error("err: "+err);
			console.log("장바구니 삭제");
			console.log("장바구니 삭제 결과: ",row);
            res.redirect('/buyer');
			connection.release();
		});
	});
});

router.get('/buyer/print-cart', function(req,res,next){
    var sql1 = "select user.ID as userID, user.name as user_name, menu.name as menu_name, menu.id as menuID, menu.price as menu_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id;   select user.id as userID, user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id group by user.id";
    //var sql2 = "select user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id;";

    multiconnection.query(sql1, function(err,row){
			if(err) console.error("err: "+err);
			console.log("장바구니 조회");
			console.log("장바구니 출력 결과: ",row);
            res.render('print-cart', {title: "장바구니 조회", rows:row});
		});
});

router.get('/buyer/buy/:userID', function(req, res, next){
    var userID = req.params.userID;
    var datas = [userID, userID];
    console.log(userID);
    var sql = "insert into user_history (user_ID, menu_ID) select user_menu.user_ID, user_menu.menu_ID from user_menu where user_ID = ?; delete from user_menu where user_ID = ?";
    multiconnection.query(sql, datas, function(err,row){
        if(err) console.error("err: "+err);
        console.log("구매 출력 결과: ",row);
        res.redirect('/buyer');
    });
});


//////////////////////////////// 현식 부분 끝 /////////////////////////////////////////////////////

/////////////////////////////// 예찬 부분 시작 ////////////////////////////////////////////////////


// 판매자 메인
router.get('/seller', function(req,res,next){
    res.render('seller', {title: "판매자"});
});

// 회원 정보 조회 검색
router.get('/seller/find', function(req,res,next){
    res.render('find', {title: "회원 정보 조회"});
});

router.get('/seller/findres', function(req,res,next){
    
    var ID = req.query.ID;
    console.log("findres ID check : ",ID);
    pool.getConnection(function(err,connection){
        var sql = "SELECT ID, NAME, PHONE FROM user WHERE ID=?";
       
        connection.query(sql,[ID], function(err,row){
            if(err) console.error(err);
            console.log("회원 정보 조회 결과: ",row);
            res.render('findres', {title: "회원 정보 조회 결과", row:row});
            connection.release();
        });
    });
});

// 상품 추가
router.get('/seller/add', function(req,res,next){
    res.render('add', {title: "상품 추가"});
});

router.post('/seller/add', function(req,res,next){
    var ID = req.body.ID;
    var NAME = req.body.NAME;
    var content = req.body.content;
    var PRICE = req.body.PRICE;
    console.log("add reqbody: ",req.body);
    
    var datas = [ID,NAME,PRICE,content];

    pool.getConnection(function(err, connection){
        // Use the connection
        var sqlForInsertmenu = "INSERT INTO menu(ID, NAME, PRICE, content) values(?,?,?,?)";
        connection.query(sqlForInsertmenu,datas, function(err,rows){
            if (err) console.error("err : " + err);
            console.log("상품 추가 data : " + JSON.stringify(rows));
            res.redirect('/seller');
            connection.release();
            // Don`t use the connection here. it has been returned to the pool.
        }); 
    });
});


// 상품 수정
router.get('/seller/updateinfo',function(req, res, next){
    var ID = req.query.ID;
    var NAME = req.query.NAME;
    console.log("상품 수정 ID check : ", ID);
    console.log("상품 수정 NAME check : ", NAME);

    pool.getConnection(function(err, connection){
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "SELECT ID, NAME, PRICE, content FROM menu WHERE ID=? AND NAME=?";
        connection.query(sql, [ID, NAME], function(err, rows){
            if(err) console.error(err);
            console.log(" 상품 수정 조회 결과 확인 : ", rows);
            res.render('updateinfo', {title:"상품 수정", row:rows[0]});
            connection.release();
        });
    });
});;

router.get('/seller/update',function(req, res, next){
    var ID = req.query.ID;
    var NAME = req.query.NAME;
    console.log("상품 수정 ID check : ", ID);
    console.log("상품 수정 NAME check : ", NAME);

    pool.getConnection(function(err, connection){
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "SELECT ID, NAME, PRICE, content FROM menu WHERE ID=? AND NAME=?";
        connection.query(sql, [ID, NAME], function(err, rows){
            if(err) console.error(err);
            console.log(" 상품 수정 조회 결과 확인 : ", rows);
            res.render('update', {title:"상품 수정", row:rows[0]});
            connection.release();
        });
    });
});;

router.post('/seller/update', function(req, res, next){
    var ID = req.body.ID;
    var NAME = req.body.NAME;
    var PRICE = req.body.PRICE;
    var content = req.body.content;
    
    console.log("상품 수정 req check",req.body);
    //var passwd = req.body.passwd;
    //var datas = [creator_id, title, content, imgcnt, idx, passwd];

    pool.getConnection(function(err,connection){
        var sql = "UPDATE menu SET NAME=?, content=?, PRICE=? WHERE ID=?";
        connection.query(sql, [NAME,content,PRICE,ID], function(err,result){
            console.log("상품 수정 결과 : ",result);
            if(err) console.error("상품 수정 중 에러 발생 err : ",err);

            if(result.affectedRows == 0){
                res.send("<script>alert('잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
            }
            else{
                res.redirect('/seller');
            }
            connection.release();
        });
    });
});


// 상품 삭제
router.get('/seller/delete',function(req, res, next){
    var ID = req.query.ID;
    var NAME = req.query.NAME;
    console.log("delete ID check : ", ID);
    pool.getConnection(function(err, connection){
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "SELECT ID FROM menu WHERE ID=? AND NAME=?";
        connection.query(sql, [ID, NAME], function(err, rows){
            if(err) console.error(err);
            console.log("delete 결과 확인 : ", rows);

            res.render('delete', {title:"글 삭제", row:rows[0]});
            connection.release();
        });
    });
});

router.post('/seller/delete', function(req, res, next){
    var ID = req.body.ID;
    var NAME = req.body.NAME;
    var datas = [ID,NAME];
    console.log("data check : ",req.body.ID);
    pool.getConnection(function(err,connection){
        var sql = "DELETE FROM menu WHERE ID=? AND NAME=?";
        connection.query(sql, datas, function(err,result){
            console.log(result);
            if(err) console.error("메뉴 삭제 중 에러 발생 err : ",err);
            if(result.affectedRows == 0){
                
                res.send("<script>alert('잘못된 요청으로 인해 삭제되지 않았습니다.');history.back();</script>");
            }
            else{
                res.redirect('/seller');

            }
            connection.release();
        });
    });
});


// 주문 현황
router.get('/seller/order', function(req,res,next){
    pool.getConnection(function(err,connection){
        // Use the connection
        var sqlForSelectList = "SELECT user_ID, menu_ID FROM user_menu";
        connection.query(sqlForSelectList, function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('order', {title: '주문 현황', rows: rows});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});


// 판매 내역 확인
router.get('/seller/sold', function(req,res,next){
    pool.getConnection(function(err,connection){
        // Use the connection
        var sqlForSelectList = "SELECT * FROM sold_history";
        connection.query(sqlForSelectList, function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('sold', {title: '판매 현황', rows: rows});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});


// 매출 통계
router.get('/seller/analytics', function(req,res,next){
    pool.getConnection(function(err,connection){
        // Use the connection
        var sqlForSelectList = "SELECT * FROM sold_history";
        connection.query(sqlForSelectList, function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('analytics', {title: '매출 통계', rows: rows});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});



//////////////////////////////// 예찬 부분 끝 /////////////////////////////////////////////////////

module.exports = router;
