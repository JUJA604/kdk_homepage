// 익스프레스 패키지 변수에 할당
const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { sendFile } = require("express/lib/response");
// express 함수를 변수에 할당
const app = express();
// express에 내장된 body parser 라이브러리 사용 설정
app.use(express.urlencoded({ extended: true }));
// mongodb 패키지 변수에 할당
const MongoClient = require("mongodb").MongoClient;
// methodoverride를 사용할 수 있도록 설정
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
// ejs 파일 추가
app.set('View engine', 'ejs');
// static 파일을 public 폴더에서 사용하겠다는 의미이다. (static 파일은 데이터가 변하지 않는 파일을 의미함 css, png 등)
app.use('/public', express.static('public'));

// 변수 db를 선언
var db;
// mongodb에 성공적으로 연결이 되었을 때, 3000번의 포트에서 서버 실행이 시작된다.
// mongoclient.connect('본인링크', function(error, client){서버 실행 코드})의 형태로 이루어진다.
MongoClient.connect('본인의 몽고db 연결 링크', function(error, client){
    // 에러 처리하는 코드 (error가 발생하면 콘솔창에 error 내용 출력)
    // -이후에 작성하는 에러 제어 코드는 주석을 생략함
    if (error){
        console.log(error);
        res.status(500).send({ message : '데이터 베이스 연결에 실패했습니다.'});
    }
    // retrydb라는 데이터베이스에 연결을 하기 위해 작성
    db = client.db('mydata');
    // 포트 3000에서 서버 실행
    app.listen('3000', function(){
    console.log("listening on 3000")
    });
    })

// /write 경로로 get 요청을 하면 write.ejs를 전송
app.get("/write", function(req, res){
    res.render("write.ejs")
});

// /shortcut 경로로 get 요청을 하면 add.ejs를 전송
app.get("/shortcut", function(req, res){
    res.render("add.ejs")
});

app.get("/detail/:id", function(req, res){
    // 여기서 req.params.id는 detail/id에서 id에 들어올 값을 의미한다.
    // detail/10으로 접속했으면 req.params.id는 10이 된다.
    // post 컬렉션에서 id가 req.params.id인 데이터를 찾아서  
    // (예를 들어 detail/4에 접속한다면, id가 4인 데이터를 보여주게 된다.)
    db.collection('post').findOne({ _id : parseInt(req.params.id) },function(error, result){
        // 만약 해당하는 id에 데이터가 존재하지 않으면 실행될 코드 입력
        if (result == null) {
            console.log('detail 페이지 불러오기에 실패했습니다.');
            res.render("error_page.ejs")
        }else{
            console.log(result)
            res.render("detail.ejs", { detail_data : result })
        }

    })
})

// 여기서의 req.body는 submit 버튼을 누르기 직전에 form에 작성한 값들을 의미함.
// /save 경로로 post 요청을 하면 late.html를 전송, 콘솔창에 가져온 데이터를 출력
app.post("/save", function(req, res){
    //late.html은 0초 후에 원래 페이지로 돌아가는 html 파일 (새로고침을 위해서 이용)
    res.sendFile( __dirname + '/late.html')
    //
    db.collection('counter').findOne({name : '게시물 개수'}, function(error, result){
        if (error) {
            console.log(error);
            console.log('detail 페이지 불러오기에 실패했습니다.');
            // 에러가 난다면 응답코드 500을 보낸다.
            res.status(500).send({ message : '불러오기 실패'});
        }
        // 변수 PostC에 저장한 할 일의 개수를 저장시킴
        var PostC = result.TotalPost
        // 수정하는 함수 updataOne
        // updataOne({수정할 데이터},{수정할 값}, function(에러, 결과){
        // if (error) return console.log(error)                             -에러 제어 코드 부분
        // })
        // operator ($inc 포함)
        // db(line 32에 선언한 mydata)에 있는 counter라는 컬렉션에 있는 name이 게시물 개수인 데이터의 TotalPost의 값이 74 line의 코드가 실핼 될 때마다 1씩 증가
        db.collection('counter').updateOne({name : '게시물 개수'},{ $inc : { TotalPost : 1 } },function(error, result){
            if (error) return console.log(error)
        });
        // mongodb는 데이터 베이스에 항목이 추가 될 때마다 id를 1씩 증가시켜주는 기능인 auto increment를 사용할 수 없기에 따로 만들어야한다.
        // 추가하는 함수 insertOne
        db.collection('post').insertOne({_id : PostC + 1, title : req.body.title , writes : req.body.date}, function(error, result){
            if (error) return console.log(error)
            console.log('-------------------------------------------------------------------')
            console.log( PostC + 1,'번째 저장 완료')
            console.log('id :',PostC + 1)
            console.log('제목 :',req.body.title)
            console.log('추가정보 :', req.body.date)
            console.log('-------------------------------------------------------------------')

        });
    });
});

app.post("/save2", function(req, res){
    //late.html은 0초 후에 원래 페이지로 돌아가는 html 파일 (새로고침을 위해서 이용)
    res.render('add.ejs')
    //
    db.collection('counter').findOne({name : 'favorites'}, function(error, result){
        if (error) {
            console.log(error);
            console.log('detail 페이지 불러오기에 실패했습니다.');
            // 에러가 난다면 응답코드 500을 보낸다.
            res.status(500).send({ message : '불러오기 실패'});
        }
        // 변수 favorite_C에 저장한 할 일의 개수를 저장시킴
        var favoriteC = result.Totalfavorite
        console.log(favoriteC)
        // 수정하는 함수 updataOne
        // updataOne({수정할 데이터},{수정할 값}, function(에러, 결과){
        // if (error) return console.log(error)                             -에러 제어 코드 부분
        // })
        // operator ($inc 포함)
        // db(line 32에 선언한 mydata)에 있는 counter라는 컬렉션에 있는 name이 게시물 개수인 데이터의 TotalPost의 값이 74 line의 코드가 실핼 될 때마다 1씩 증가
        db.collection('counter').updateOne({name : 'favorites'},{ $inc : { Totalfavorite : 1 } },function(error, result){
            if (error) return console.log(error)
        });
        // mongodb는 데이터 베이스에 항목이 추가 될 때마다 id를 1씩 증가시켜주는 기능인 auto increment를 사용할 수 없기에 따로 만들어야한다.
        // 추가하는 함수 insertOne
        db.collection('favorite').insertOne({_id : favoriteC + 1 ,favorite_Ns : req.body.f_title ,urls : req.body.f_url }, function(error, result){
            if (error) return console.log(error)
            console.log('-------------------------------------------------------------------')
            console.log( favoriteC + 1,'번째 저장 완료')
            console.log('id :', favoriteC + 1)
            console.log('바로가기 이름 :',req.body.f_title)
            console.log('바로가기 url :', req.body.f_url)
            console.log('-------------------------------------------------------------------')

        });
    });
});

// 홈페이지 (/)경로로 get 요청을 하면 index.ejs를 전송
app.get("/", function(req, res){
    // result에 가져온 값이 저장이 된다.
    db.collection('favorite').find().toArray(function(error, result){
        var FV = result
        // find (찾는 함수), toArray (모든 항목을 찾는 함수)
        if( result == null ) {
            console.log(error)
        } else {
        console.log('-------------------------------------------------------------------')
        console.log(FV)
        console.log('-------------------------------------------------------------------')
        // result는 db.collection('post').find().toArray의 함수 안에서만 사용 가능하다
        // 데이터 베이스에서 가져온 값들을 ejs 파일에서 사용하려면, { 임의의 이름 : result }의 json 형식을 render의 두 번째 파라미터로 추가하면 된다.
    res.render("index.ejs", { favorite_D : result })
        }
    });
});

// /list 경로로 get 요청을 하면 list.ejs를 전송
app.get("/list", function(req, res){
    // db.collection('콜렉션이름'). 을 하면 '콜렉션이름'에 맞는 콜렉션에 있는 정보를 수정하겠다는 의미이다.
    db.collection('post').find().toArray(function(error, result){
        // find (찾는 함수), toArray (모든 항목을 찾는 함수)
        if(result == null){
            console.log(error)
        }else{
            console.log('-------------------------------------------------------------------')
            console.log(result)
            console.log('-------------------------------------------------------------------')
            // result에 가져온 값이 저장이 된다.
            // result는 db.collection('post').find().toArray의 함수 안에서만 사용 가능하다
            // 데이터 베이스에서 가져온 값들을 ejs 파일에서 사용하려면, { 임의의 이름 : result }의 json 형식을 render의 두 번째 파라미터로 추가하면 된다.
            res.render("list.ejs", { posts : result });
        };
    });
});

// /delete 경로로 delete 요청을 하면
app.delete('/delete', function(req, res){
    // /delete 경로로 가져온 id 값을 출력한다.
    console.log(req.body)
    //출력을 하면 id에 들어간 값이 문자열로 인식이 되는데, 이러면 삭제가 정상적으로 이루어지지 않기 때문에 숫자형으로 변환을 해준다.
    req.body._id = parseInt(req.body._id)
    // 다시 콘솔에서 출력을 하도록 하면 id의 값이 숫자형으로 변경된 것을 볼 수 있다.
    console.log(req.body)
    // 이름이 post인 컬렉션을 찾아서 값 하나를 deleteOne 함수를 이용해서 값을 하나 지운다.
    db.collection('post').deleteOne(req.body, function(error, result){
        if(error){
            console.log(error);
            console.log('삭제에 실패했습니다.');
            // 에러가 난다면 응답코드 400을 보낸다.
            res.status(400).send({ message : '삭제 실패'});
        }
        // 기록 삭제를 콘솔창에서 확인하기 위한 코드
        console.log(req.body._id,'번째 기록이 삭제 되었습니다');
        // 응답이 정상적으로 완료되면 삭제 성공이라는 메세지가 나온다.
        res.status(200).send({ message : '삭제 성공'});
    });
});

// /delete 경로로 delete 요청을 하면
app.delete('/F_delete', function(req, res){
    // /delete 경로로 가져온 id 값을 출력한다.
    console.log(req.body)
    //출력을 하면 id에 들어간 값이 문자열로 인식이 되는데, 이러면 삭제가 정상적으로 이루어지지 않기 때문에 숫자형으로 변환을 해준다.
    req.body._id = parseInt(req.body._id)
    // 다시 콘솔에서 출력을 하도록 하면 id의 값이 숫자형으로 변경된 것을 볼 수 있다.
    console.log(req.body)
    // 이름이 post인 컬렉션을 찾아서 값 하나를 deleteOne 함수를 이용해서 값을 하나 지운다.
    db.collection('favorite').deleteOne(req.body, function(error, result){
        if(error){
            console.log(error);
            console.log('삭제에 실패했습니다.');
            // 에러가 난다면 응답코드 400을 보낸다.
            res.status(400).send({ message : '삭제 실패'});
        }
        // 기록 삭제를 콘솔창에서 확인하기 위한 코드
        console.log('-------------------------------------------------------------------')
        console.log(req.body._id,'번째 기록이 삭제 되었습니다');
        console.log(req.body)
        console.log('-------------------------------------------------------------------')
        // 응답이 정상적으로 완료되면 삭제 성공이라는 메세지가 나온다.
        res.status(200).send({ message : '삭제 성공'});
    });
});


// edit/?의 경로로 누군가가 요청을 하면 ?의 내용을 보여줌
// /edit/? 경로로 get 요청이 들어오면, post 컬렉션에서 _id가 ?인 데이터를 찾아서 그 값을 /edit/?에서 사용할 수 있게 해준다.
// :id를 url의 파라미터라고 한다.
// :id는 req.params.id라고도 표현함
app.get('/edit/:id', function(req, res){
    // 컬렉션 post에서 _id가 /edit/id의 id와 같은 데이터를 가져온다.
    // url의 파라미터는 문자열로 인식되기 때문에 parseInt 함수를 이용해서 string형에서 int형으로 변경해준다.
    // 이렇게 가져온 데이터는 result에 담기게 된다.
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        if (result == null) {
            // 만약 req.params.id의 id에 해당하는 _id를 가진 데이터가 없으면 아래의 코드를 실행 해준다.
            console.log('edit 페이지 불러오기에 실패했습니다.');
            res.render("error_page.ejs")
        }else{
            // req.params.id의 id에 해당하는 _id를 가진 데이터가 있으면 실행 될 코드
            console.log('-------------------------------------------------------------------')
            console.log('수정 페이지에 들어왔습니다.')
            console.log(result)
            console.log('-------------------------------------------------------------------')
            // post_E 라는 이름으로 데이터 베이스에서 가져온 값을 edit.ejs에서 사용할 수 있도록 설정
            res.render('edit.ejs', { post_E : result })
        }
    })
})

app.put('/edit', function(req, res){
    // db.collection('컬렉션이름').updataOne( {수정할 데이터 }, { 어떻게 수정할지 }, function(error, result){ })
    // 수정할 데이터에는 겹치지 않는 id를 이용해서 각각의 데이터를 식별할 수 있도록 한다.
    // _edit.ejs에서 안 보이는 input 태그를 사용한 이유가 이 것이다.
    db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { title : req.body.title, writes : req.body.date}}, function(error, result){
        console.log('-------------------------------------------------------------------')
        console.log('데이터가 수정되었습니다.')
        console.log(req.body)
        console.log('-------------------------------------------------------------------')
        res.redirect('/list')
    })
})