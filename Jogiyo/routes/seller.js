var express = require('express');
var router = express.Router();
var fs = require('fs');
const multer = require('multer');

// MySQL loading
var mysql = require('mysql');
//const { connect, route } = require('./joinForm');

var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'jogiyo',
    password: '1234'
});

// 판매자 메인
router.get('/', function(req,res,next){
    res.render('seller', {title: "판매자"});
});

// 회원 정보 조회 검색
router.get('/find', function(req,res,next){
    res.render('find', {title: "회원 정보 조회"});
});

router.get('/findres', function(req,res,next){
    
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
router.get('/add', function(req,res,next){
    res.render('add', {title: "상품 추가"});
});

router.post('/add', function(req,res,next){
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
router.get('/updateinfo',function(req, res, next){
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

router.get('/update',function(req, res, next){
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

router.post('/update', function(req, res, next){
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
router.get('/delete',function(req, res, next){
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

router.post('/delete', function(req, res, next){
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
router.get('/order', function(req,res,next){
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
router.get('/soldout', function(req,res,next){
    pool.getConnection(function(err,connection){
        // Use the connection
        var sqlForSelectList = "SELECT menu_ID, user_ID, seller_ID, price, date FROM soldout";
        connection.query(sqlForSelectList, function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('soldout', {title: '판매 현황', rows: rows});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});


// 매출 통계
router.get('/analytics', function(req,res,next){
    pool.getConnection(function(err,connection){
        // Use the connection
        var sqlForSelectList = "SELECT menu_ID, user_ID, seller_ID, price, date FROM soldout";
        connection.query(sqlForSelectList, function(err,rows){
            if (err) console.error("err : "+err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('analytics', {title: '매출 통계', rows: rows});
            connection.release();

            // Don`t use the connection here, it has been returned th the pool.
        });
    });
});



module.exports = router;
