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
		res.send("<script>alert('로그인 되었습니다.');history.back();</script>");
    }
    res.render('login', { title: 'login'});
});

/* POST 로그인 */
router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true }), function(req, res) {

	// 각 회원 종류에 대한 분기.
	if(req.user.AUTH=='판매자'){
		console.log('seller auth : ',req.user.AUTH );
		res.redirect('/seller');
	}
	else if(req.user.AUTH=='관리자'){
		console.log('manager auth : ',req.user.AUTH );
		res.redirect('/account/userlist/1');
	}
	else{
		console.log("buyer here : ",req.user.AUTH);
		res.redirect('/');
	}

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
        var login = req.user.ID;
        var auth = req.user.AUTH;
    }
	res.render('index', { title: 'JOGIYO', login:login, auth:auth });
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


router.get('/account', isAuthenticated, function(req,res,next){
	if(req.user.AUTH != "관리자")
		res.redirect('/');
	else
		res.redirect('/account/userlist/1');
})

router.get('/account/userlist', isAuthenticated, function(req,res,next){
	if(req.user.AUTH != "관리자")
		res.redirect('/');
	else
		res.redirect('/account/userlist/1');
})

router.get('/account/userlist/:page', isAuthenticated, function(req, res, next) {
	var page = req.params.page;
	pool.getConnection(function(err, connection){
		connection.query("SELECT * FROM user", function(err, rows){
			if(err) console.error("err : "+err);
			res.render('account', {title:'회원 관리', rows:rows, page:page, page_num:10});
			connection.release();
		});
	});
});

router.get('/account/findres/:ID', isAuthenticated, function(req,res,next){
    
    var ID = req.params.ID;
    console.log("findres ID check : ",ID);
    pool.getConnection(function(err,connection){
        var sql = "SELECT * FROM user WHERE ID=?";
       
        connection.query(sql,[ID], function(err,row){
            if(err) console.error(err);
            else{
            	if(row==0)
            	{
            		res.send("<script>alert('잘못된 검색입니다.');history.back();</script>");
            	}
            	else
            	{
    	        	console.log("회원 정보 검색 결과: ",row);
	            	res.render('findres', {title: "회원 정보 검색 결과", row:row});
            	}
            }
            connection.release();
        });
    });
});

router.get('/account/info/:id', isAuthenticated, function(req, res, next){
	var id = req.params.id;
	var auth = req.user.AUTH;

	pool.getConnection(function(err,connection){
		connection.query("SELECT * FROM user WHERE ID=?",[id],function(err,rows){
			if(err) {
				console.error("err: "+err);
			}
			else
			{
				res.render('info', {title:"회원 정보 조회", rows:rows[0], auth:auth});
			}
			connection.release();
		});
	});
});

router.get('/account/update', isAuthenticated, function(req, res, next){
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

router.post('/account/update', isAuthenticated, function(req, res, next){
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

router.get('/account/delete', isAuthenticated, function(req, res, next){
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


//////////////////////////////// 관리자 끝 /////////////////////////////////////////////////////

/////////////////////////////// 구매자 시작 ////////////////////////////////////////////////////

router.get('/buyer', isAuthenticated, function(req,res,next){
    res.render('buyer', {title: "구매자"});
});

router.get('/buyer/print-store', isAuthenticated, function(req, res, next){
	pool.getConnection(function(err, connection){
		var sql = "select * from store";
		connection.query(sql, function(err, rows){
			if(err) console.error("err : " + err);
			else
			{
				console.log("매장 조회 결과 : ", rows);
				res.render('print-store', {title:"매장 조회", rows:rows, category:"전체", price:0, storename:""});
			}
			connection.release();
		});
	});
});

router.post('/buyer/print-store', isAuthenticated, function (req, res, next) {
    var category = req.body.category;
    var price = req.body.price;
    var storename = req.body.storename;
    var x = req.body.lat;
    var y = req.body.lng;
    var datas = new Array();
    var sql = "select count(distinct review.id) as reviewcnt, store.ID, store.NAME, PHONE, store.RATE, DELIVERY_TIME, UPTIME, CLOSETIME, LAT, LNG, PRICE_LIMIT  from store inner join menu on store.id = menu.store_id  left outer join review on review.store_id = store.id inner join category_store on category_store.store_ID = store.id inner join category on category_store.category_ID = category.ID  WHERE ((UPTIME>CLOSETIME and (now()>UPTIME or now()<CLOSETIME)) or (UPTIME<now() and now()<CLOSETIME))";
    if (category != "전체" || price != ">0" || storename != "") {
        sql += " and ";
        if (category != "전체") {
			datas.push(category);
            sql += "category.name = ?";
		}
		if (price != ">0"){
			if(category != "전체") sql += " and ";
			sql += "menu.price = any (select menu.price from menu where menu.price "  + price + " )";
			
		}
		if (storename != ""){
			if(category != "전체" || price != '>0') sql += " and ";
			datas.push(storename);
			sql += "store.name = ?";
		}
		sql=sql.replace(/['"]+/g, '');
	}
	sql += " group by store.id  ";
	if(req.body.sort==1)
		sql += "ORDER BY RATE DESC";
	else if(req.body.sort==2)
		sql += "ORDER BY reviewcnt DESC";
	else if(req.body.sort==3)
	{
		sql += "ORDER BY (((LAT-?)*(LAT-?))+((LNG-?)*(LNG-?)))";
		datas.push(x,x,y,y);
	}
	else if(req.body.sort==4)
		sql += "ORDER BY PRICE_LIMIT";
	else if(req.body.sort==5)
		sql += "ORDER BY DELIVERY_TIME";

	console.log(sql);
	console.log(datas);
	if(datas.length == 0) {
		pool.getConnection(function(err, connection){
			connection.query(sql, function(err, rows){
				if(err) console.error("err : " + err);
				else
				{
					console.log("매장 조회 결과 : ", rows);
					console.log(req.body.lat, req.body.lng);
					res.render('print-store', {title:"매장 조회", rows:rows, category:category, price:price, storename:storename});
				}
				connection.release();
			});
		});
	}
	else {
		pool.getConnection(function(err, connection){
			connection.query(sql, datas, function(err, rows){
				if(err) console.error("err : " + err);
				else
				{
					console.log("매장 조회 결과 : ", rows);
					res.render('print-store', {title:"매장 조회", rows:rows, category:category, price:price, storename:storename});
				}
				connection.release();
			});
		});
	}
});


router.get('/buyer/print-menu/:id', isAuthenticated, function(req,res,next){
	var store_id = req.params.id;
	var hint = req.user.ID;
    var sql1 = "SELECT * FROM menu WHERE store_ID=?;";
    var sql2 = "select user.ID as userID, user.name as user_name, menu.name as menu_name, menu.id as menuID, menu.price as menu_price, user_menu.cnt as menu_cnt from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id where user.ID=?;";
    var sql3 = "SELECT * FROM review inner join user on user_id = user.id WHERE store_ID=?;";
    var sql4 = "SELECT store.NAME as store_name, category.NAME as category_name, PRICE_LIMIT, DELIVERY_TIME, UPTIME, CLOSETIME, RATE, PHONE FROM store inner join category_store on store.ID = store_ID inner join category on category_ID = category.ID WHERE store.ID=?;";
		
	multiconnection.query(sql1+sql2+sql3+sql4, [store_id, req.user.ID, store_id, store_id],function(err,rows){
        if(err) console.error("에러:"+err);
        else{
			
			console.log("hint: ",hint);
    		console.log("메뉴 조회 결과 : ", rows);

            res.render('print-menu', {title: "메뉴 조회", rows:rows, store_id:store_id, hint: hint});

        }
    });
    	
});

router.get('/buyer/cart/:store_id/:menuID', isAuthenticated, function(req,res,next){
	var store_id = req.params.store_id;
    var menuID = req.params.menuID;
    console.log(menuID);
    console.log(req.body.userID);
    var datas = [req.user.ID, menuID];
    pool.getConnection(function(err, connection){
		var sql = "insert into user_menu (user_ID, menu_ID) values(?, ?) ON DUPLICATE KEY UPDATE cnt = cnt + 1"
		connection.query(sql, datas, function(err,rows){
			if(err) console.error("err: "+err);
			else
			{
				console.log("rows : " + JSON.stringify(rows));
            	res.redirect('/buyer/print-menu/'+store_id);
			}
			connection.release();
		});
	});
});

router.get('/buyer/delete-cart/:store_id/:menuID', isAuthenticated, function(req,res,next){
    var userID = req.user.ID;
    var store_id = req.params.store_id;
    var menuID = req.params.menuID;
    var datas = [userID, menuID];
    console.log(userID, menuID);
    var sql = "delete from user_menu where user_ID = ? and menu_ID = ?";
	console.log(sql);
	
    pool.getConnection(function(err, connection){		
		connection.query(sql, datas, function(err,row){
            console.log(sql);
			if(err) console.error("err: "+err);
			else
			{
				console.log("장바구니 삭제 결과: ",row);
            	res.redirect('/buyer/print-menu/'+store_id);
			}
			connection.release();
		});
	});
});

router.get('/buyer/print-cart', isAuthenticated, function(req,res,next){
    var sql1 = "select menu.store_ID as store_ID, user.ID as userID, user.name as user_name, menu.name as menu_name, menu.id as menuID, menu.price as menu_price, user_menu.cnt as menu_cnt from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id where user.ID=?"
    //   select user.id as userID, user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id where user.ID=? group by user.id";
    //var sql2 = "select user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id;";

    multiconnection.query(sql1, [req.user.ID], function(err,row){
			if(err) console.error("err: "+err);
			else
			{
				if(row== 0)
				{
            		res.send("<script>alert('장바구니가 비었습니다.');history.back();</script>");
            	}
            	else
            	{
					console.log("장바구니 조회");
					console.log("장바구니 출력 결과: ",row);
            		res.render('print-cart', {title: "장바구니 조회", rows:row});
            	}
        	}
		});
});

router.get('/buyer/buy/:userID', isAuthenticated, function(req, res, next){
    var userID = req.params.userID;
    var datas = [userID, userID];
    console.log(userID);
    var sql = "insert into sold_history (user_ID, menu_ID, cnt) select user_ID, menu_ID, cnt from user_menu where user_ID = ? ; delete from user_menu where user_ID = ?";
    multiconnection.query(sql, datas, function(err,row){
        if(err) console.error("err: "+err);
        console.log("구매 출력 결과: ",row);
        res.redirect('/purchase');
    });
});

router.get('/buyer/history', isAuthenticated, function(req, res, next){
	var userID = req.user.ID;
	pool.getConnection(function(err, connection){
		var sql = "SELECT menu.NAME as menu_name, menu.PRICE as menu_price, cnt, history FROM sold_history inner join menu ON menu_ID = menu.ID inner join user ON user_ID = user.ID WHERE user.ID=? ORDER BY history";
		connection.query(sql, [userID], function(err,rows){
			if(err) console.error("err: "+err);
			else
			{
        		console.log("결과: ",rows);
            	res.render('buy_history', {title: "구매내역 조회", rows:rows});
        	}
			connection.release();
		});
	});
});

// 구매 페이지
router.get('/purchase',isAuthenticated, function(req, res, next){
	res.render('purchase');
});

// 구매 페이지
router.post('/purchase',isAuthenticated, function(req, res, next){

	var userID = req.body.data_id;
	var menu = req.body.data_menu;

    console.log("usr ID : ",userID, "menu : ", menu);
    var sql = "insert into sold_history (user_ID, menu_ID, cnt) select user_ID, menu_ID, cnt from user_menu where user_ID = ? ; delete from user_menu where user_ID = ?";
    multiconnection.query(sql, [userID, userID], function(err,row){
        if(err) console.error("err: "+err);
        console.log("구매 출력 결과: ",row);
        res.redirect('/purchase');
    });
});

// 쿠폰 돌림판
router.get('/coupon', function(req, res, next){
	res.render('coupon');
});

router.post('/review/:store_id',isAuthenticated, function(req, res, next){
	var store_id = req.params.store_id;
	var menu_id = req.body.menu;
	var rate = req.body.rate;
	var content = req.body.review;
	if(rate==null)
		rate=0;
	console.log("smrc"+store_id+menu_id+rate+content);
	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO review(rate, content, user_ID, menu_ID, store_ID) values(?,?,?,?,?)";
		connection.query(sql, [rate, content, req.user.ID, menu_id, store_id], function(err, rows){
			if(err) console.error("err:"+err);
			else
			{
				console.log(rows);
				res.redirect('/buyer/print-menu/'+store_id);
			}
			connection.release();
		})
	})
})

//////////////////////////////// 구매자 끝 /////////////////////////////////////////////////////

/////////////////////////////// 판매자 시작 ////////////////////////////////////////////////////


// 판매자 메인
router.get('/seller', isAuthenticated, function(req,res,next){
	var store_id = req.user.ID;
    pool.getConnection(function(err, connection){
        var sql = "SELECT * FROM store inner join store_user on store_ID = store.ID WHERE user_ID=?";
        connection.query(sql,[req.user.ID], function(err,rows){
            if (err) console.error("err : " + err);
    		res.render('seller', {title: "판매자", rows:rows, store_id:store_id});
            connection.release();
        }); 
    });
});

router.get('/store_add', isAuthenticated, function(req, res, next){
	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM category";
		connection.query(sql, function(err,rows){
			if(err) console.error("err: "+err);
			else
			{
				res.render('store_add', {title:'매장 추가', rows:rows});
			}
			connection.release();
		});
	});
});

router.post('/store_add', isAuthenticated, function(req, res, next){
	var name = req.body.name;
	var tel = req.body.tel;
	var category = req.body.category;
	var dtime = req.body.dtime;
	var price = req.body.price;
	var open = req.body.open;
	var close = req.body.close;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var data = [name, tel, dtime, open, close, price, lat, lng];
	

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO store(NAME, PHONE, DELIVERY_TIME, UPTIME, CLOSETIME, PRICE_LIMIT, LAT, LNG) values(?, ?, ?, ?, ?, ?, ?, ?)";

		connection.query(sql, data, function(err,rows){
			if(err) console.error("err: "+err);
			else
			{
				console.log("rows:",rows);
				var store_ID = rows.insertId;
				res.redirect('/category_store/'+store_ID+'/'+category);
			}
			connection.release();
		});
	});
});

router.get('/category_store/:store_id/:category', isAuthenticated, function(req, res, next){
	var store_id = req.params.store_id;
	var category = req.params.category;

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO category_store values(?, ?)";
		connection.query(sql, [category, store_id], function(err, rows){
			if(err) console.error("err: "+err);
			else
			{
				console.log("rows: ", rows);
				res.redirect('/store_seller/'+store_id);
			}
			connection.release();
		})
	})
});

router.get('/store_seller/:id', isAuthenticated, function(req, res, next){
	var store_ID = req.params.id;
	var seller_ID = req.user.ID;

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO store_user values (?, ?)"
		connection.query(sql, [store_ID, seller_ID], function(err,rows){
			if(err) console.log("err: ", +err);
			else
			{
				console.log("rows: ",rows);
				res.send('<script>alert("매장 추가 성공");location.href="/seller"; </script>');
			}
			connection.release();
		});
	});
});

router.get('/store', isAuthenticated, function(req, res, next){
	res.redirect('/seller');
});

router.get('/store/:id', isAuthenticated, function(req, res, next){
	var id = req.params.id;
    pool.getConnection(function(err, connection){
        var sql = "SELECT * FROM store WHERE ID=?";
		connection.query(sql, [id], function(err,rows){
			if(err) console.error("err: "+err);
			else
			{
        		console.log("결과: ",rows);
            	res.render('store', {title: rows[0].NAME, rows:rows});
        	}
			connection.release();
		});
	});
});

router.get('/store_mod/:id', isAuthenticated, function(req, res, next){
	var id = req.params.id;

	pool.getConnection(function(err,connection){
		var sql = "SELECT * FROM store WHERE ID=?";
		connection.query(sql, [id], function(err, rows){
			if(err) console.error(err);
			res.render('store_mod', {title:"가게 정보 수정", row:rows[0]});
			connection.release();
		});
	});
});

router.post('/store_mod/:id', isAuthenticated, function(req, res, next){
	var id = req.params.id;
	var name = req.body.name;
	var tel = req.body.tel;
	var dtime = req.body.dtime;
	var price = req.body.price;
	var open = req.body.open;
	var close = req.body.close;
	var data = [name, tel, dtime, open, close, price, id];

	pool.getConnection(function(err, connection){
		var sql = "UPDATE store SET NAME=?, PHONE=?, DELIVERY_TIME=?, UPTIME=?, CLOSETIME=?, PRICE_LIMIT=? WHERE ID=?";
		connection.query(sql, data, function(err, result){
			if(err) {
				console.error("가게 정보 수정 중 에러 발생 err : ",err);
			}
			else
			{
				if(result.affectedRows == 0)
				{
					res.send("<script>alert('가게 정보 수정에 실패하였습니다.');history.back();</script>");
				}
				else
				{
					res.redirect('/store/'+id);
				}
			}
			connection.release();
		});
	});
});

router.get('/store_del/:id', isAuthenticated, function(req, res, next){
	var id = req.params.id;
	pool.getConnection(function(err,connection){
		var sql = "DELETE FROM store WHERE id=?";
		connection.query(sql, [id], function(err, rows){
			if(err) console.log("err : " + err);
			else
			{
				res.send('<script>alert("가게가 삭제되었습니다.");location.href="/seller";</script>');
			}
			connection.release();
		});
	});
});

router.get('/product/:store_id/:menu_id', isAuthenticated, function(req, res, next){
	var store_id = req.params.store_id;
	var menu_id = req.params.menu_id;
	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM menu WHERE ID=?";
		connection.query(sql, [menu_id], function(err, rows){
			if(err) console.log("err :" + err);
			else
			{
				res.render('product', {title: "상품 상세 정보", rows:rows, store_id:store_id});
			}
			connection.release();
		});
	});
});

router.get('/product_list/:id', isAuthenticated, function(req, res, next){
	var store_id = req.params.id;
	pool.getConnection(function(err, connection){
		var sql = "SELECT menu.ID as menu_ID, menu.NAME as menu_name, menu.PRICE as menu_price, menu.content as menu_content FROM menu WHERE store_ID = ?";
		connection.query(sql, [store_id], function(err, rows){
			if(err) console.log("err: "+err);
			else
			{
				console.log("상품: ", rows);
				res.render('product_list', {title: "상품 정보", rows:rows, store_id:store_id});
			}
			connection.release();
		});
	});
});

// 상품 추가
router.get('/product_add/:id', isAuthenticated, function(req,res,next){
	var id = req.params.id;
	console.log("id:"+id)
    res.render('product_add', {title: "상품 추가", store_id:id});
});

router.post('/product_add/:id', isAuthenticated, function(req,res,next){
	var store_id = req.params.id;
    var NAME = req.body.NAME;
    var content = req.body.content;
    var PRICE = req.body.PRICE;
    
    var datas = [store_id, NAME,PRICE,content];
	console.log("s",store_id);

    pool.getConnection(function(err, connection){
        var sqlForInsertmenu = "INSERT INTO menu(store_ID, NAME, PRICE, content) values(?,?,?,?)";
        connection.query(sqlForInsertmenu,datas, function(err,rows){
            if (err) console.error("err : " + err);
            console.log("상품 추가 data : " + JSON.stringify(rows));
			res.redirect('/product_list/'+store_id);
            connection.release();
        }); 
    });
});


router.get('/product_del/:store_id/:menu_id', isAuthenticated, function(req, res, next){
    var store_id = req.params.store_id;
    var menu_id = req.params.menu_id;
    pool.getConnection(function(err,connection){
        var sql = "DELETE FROM menu WHERE ID=?";
        connection.query(sql, [menu_id], function(err,result){
            if(err) console.error("err : ",err);
            else{
            	if(result.affectedRows == 0){
	                res.send("<script>alert('삭제 실패');history.back();</script>");
	            }
    	        else{
                	res.redirect('/product_list/'+store_id);
	            }
	        }
            connection.release();
        });
    });
});

router.get('/product_mod/:store_id/:menu_id', isAuthenticated, function(req, res, next){
    var store_id = req.params.store_id;
    var menu_id = req.params.menu_id;

    pool.getConnection(function(err, connection){
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "SELECT * FROM menu WHERE ID=?";
        connection.query(sql, [menu_id], function(err, rows){
            if(err) console.error(err);
            else
            {
            	res.render('product_mod', {title:"상품 수정", rows:rows[0], store_id:store_id});
            }
            connection.release();
        });
    });
});;

router.post('/product_mod/:store_id/:menu_id', isAuthenticated, function(req, res, next){
	var store_id = req.params.store_id;
	var menu_id = req.params.menu_id;
    var NAME = req.body.NAME;
    var PRICE = req.body.PRICE;
    var content = req.body.content;

    pool.getConnection(function(err,connection){
        var sql = "UPDATE menu SET NAME=?, content=?, PRICE=? WHERE ID=?";
        connection.query(sql, [NAME,content,PRICE,menu_id], function(err,result){
            console.log("상품 수정 결과 : ",result);
            if(err) console.error("상품 수정 중 에러 발생 err : ",err);

            if(result.affectedRows == 0){
                res.send("<script>alert('잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
            }
            else{
                res.redirect('/product/'+store_id+'/'+menu_id);
            }
            connection.release();
        });
    });
});

// 주문 현황
router.get('/store_order/:id', isAuthenticated, function(req,res,next){
	var id = req.params.id;
    pool.getConnection(function(err,connection){
        var sql = "SELECT history, menu.NAME as menu_name, PRICE, cnt, user_ID FROM sold_history inner join menu ON menu.ID = menu_ID inner join store on store_ID = store.ID where store_ID = ? and history>DATE_SUB(NOW(), INTERVAL DELIVERY_TIME MINUTE)";
        connection.query(sql, [id], function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('store_sold', {title: '주문 현황', rows: rows, store_id:id});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});


// 판매 내역 확인
router.get('/store_sold/:id', isAuthenticated, function(req,res,next){
	var store_id = req.params.id;
    pool.getConnection(function(err,connection){
        var sql = "SELECT history, menu.NAME as menu_name, PRICE, cnt, user_ID FROM sold_history inner join menu ON menu.ID = menu_ID inner join store on store_ID = store.ID where store_ID = ? and history<DATE_SUB(NOW(), INTERVAL DELIVERY_TIME MINUTE)";
        connection.query(sql, [store_id], function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('store_sold', {title: '판매 현황', rows: rows, store_id:store_id});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});

//////////// 남음 ////////////
// 매출 통계
router.get('/analytics/:store_id', isAuthenticated, function(req,res,next){
	var id = req.params.store_id;
	var his;
	console.log("id: ",req.params);
    pool.getConnection(function(err,connection){
        var sql = "SELECT date_format(history,'%d') as history, menu.NAME as menu_name, PRICE, cnt, user_ID FROM sold_history inner join menu ON menu.ID = menu_ID inner join store on store_ID = store.ID where store_ID = ? and history<DATE_SUB(NOW(), INTERVAL DELIVERY_TIME MINUTE)";
        connection.query(sql, [id], function(err,rows){
			if (err) console.error("err : ",err);
			
            console.log("rows : ",rows);

            res.render('analytics', {title: '매출 통계', rows: rows, store_id:id});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});



//////////////////////////////// 판매자 끝 /////////////////////////////////////////////////////

module.exports = router;
