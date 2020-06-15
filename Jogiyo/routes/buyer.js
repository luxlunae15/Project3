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

router.get('/', function(req,res,next){
    res.render('buyer', {title: "구매자"});
});

router.get('/print-menu', function(req,res,next){
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

router.get('/cart/:menuID', function(req,res,next){
    var menuID = req.params.menuID;
    res.render('cart',{title: "장바구니", menuID:menuID});
    console.log(menuID);
});

router.post('/add-cart/:menuID', function(req, res, next){
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

router.get('/delete-cart/:userID/:menuID', function(req,res,next){
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

router.get('/print-cart', function(req,res,next){
    var sql1 = "select user.ID as userID, user.name as user_name, menu.name as menu_name, menu.id as menuID, menu.price as menu_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id;   select user.id as userID, user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id group by user.id";
    //var sql2 = "select user.name as user_name, sum(menu.price) as total_price from user_menu inner join menu on menu_ID = menu.ID inner join user on user_ID = user.id;";

    multiconnection.query(sql1, function(err,row){
			if(err) console.error("err: "+err);
			console.log("장바구니 조회");
			console.log("장바구니 출력 결과: ",row);
            res.render('print-cart', {title: "장바구니 조회", rows:row});
		});
});

router.get('/buy/:userID', function(req, res, next){
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

module.exports = router;
