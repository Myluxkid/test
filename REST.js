var mysql   = require("mysql");

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

//    Display all users
    router.get("/users",function(req,res){
        var query = "SELECT * FROM ??";
        var table = ["users"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Users" : rows});
            }
        });
    });
    
    
    //    Signin
    router.post("/signin",function(req,res){
        var query = "SELECT ?? FROM ?? WHERE ??=?";  //SELECT `password` FROM `users` WHERE `username`='minul'
        var table = ["password", "users", "username", req.body.username];
        query = mysql.format(query,table);
        
        connection.query(query,function(err,rows){
            
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                
                if(new String(rows[0].password).valueOf() == new String(req.body.password).valueOf()){
                    console.log("User Authenticated");
                    res.json({"Error" : false, "Message" : "Success", "Authenticated" : true});
                }else{
                    res.json({"Error" : false, "Message" : "Success", "Authenticated" : false});
                }
                
            }
        });
    });
    
//    Sign Up
    router.post("/signup",function(req,res){
        var query_user = "INSERT INTO ??(??, ??, ??, ??) VALUES (?,?,?,?)"
        var data_user = ["users","user_id","username","description","password",null, req.body.username,req.body.description,req.body.password];
        
        query_user = mysql.format(query_user,data_user);
        connection.query(query_user,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                console.log("User Details added");
//                res.json({"Error" : false, "Message" : "User Added !"});
                
                var last_user_id = rows.insertId;
                console.log(last_user_id);
                  
                category_set = [];
                category_set = req.body.categories;
                console.log(category_set);
                

                try{
                    
                for (var i = 0; i < category_set.length; i++){
                    var query_category = "INSERT INTO ??(??,??) VALUES(?,?)"
                    var data_category = ["category_user", "category_name", "user_id", category_set[i], last_user_id];
                    
                    query_category = mysql.format(query_category,data_category);
                    connection.query(query_category,function(err,rows){
                        if(err) {
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
                            console.log("category added");
//                            res.json({"Error" : false, "Message" : "Categories Added !"});
                        }
                    });
                }
                    res.json({"Error" : false, "Message" : "User Successfully Added!"});
                }catch (err){
                    console.log(err);
                }
            }
        });
    });
    
    
    // Fliter similar users
    router.get("/similarPeople/:user_id",function(req,res){
    try{
        var total_categories_of_user = 0;
        
        //getting users categories
        var query_user_categories = "SELECT * FROM ?? WHERE ??=?";
        var data_user_categories = ["category_user","user_id",req.params.user_id];
        query_user_categories = mysql.format(query_user_categories,data_user_categories);
        
        connection.query(query_user_categories,function(err,rows){
            total_categories_of_user = rows.length;
            if(rows.length==0){
                res.json({"Error" : true, "Message" : "User not found"});
            }
            var  similarPeopleList = [];
            var  similarPeopleListPoints = [];
            if(err) {
                console.log("Error in query 1");
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                var i = 0;
                
                rows.forEach(function(datum, i){

                    //getting people with simliar categories
                    var query_categories = "SELECT * FROM ?? WHERE ??=?";
                    var data_categories = ["category_user","category_name",rows[i].category_name];
                    query_categories = mysql.format(query_categories,data_categories);
                    //console.log(query_categories);
                    
                    connection.query(query_categories,function(err,rows_cat){
                        if(err) {
                            console.log(" Error in query 2");
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
//                            Add Two-dimentianal array
                            var flag = 1;
                            
                            for(var j = 0; j<rows_cat.length; j++){
//                                console.log(rows_cat[j]);
                                if (similarPeopleList.includes(rows_cat[j].user_id)) {
                                    //In array so add points 
                                    similarPeopleListPoints[similarPeopleList.indexOf(rows_cat[j].user_id)][1] = similarPeopleListPoints[similarPeopleList.indexOf(rows_cat[j].user_id)][1] + 1; 
                                    console.log("In Array");
                                } else {
                                    //Not in array  
                                     console.log("Not in Array");
                                    if(rows_cat[j].user_id != req.params.user_id){
                                        //add points here
                                        similarPeopleList.push(rows_cat[j].user_id);
                                        similarPeopleListPoints.push([rows_cat[j].user_id,1]);
                                    }
                                }
                            }
                                                
//                            console.log(i);
                            if(i==rows.length-1){
                                console.log(similarPeopleList); 
                                res.json({"Error" : false, "Message" : "Success", "Users" : similarPeopleListPoints, "userCategoryCount": total_categories_of_user});
                            } 
                        }
                       
                    });
                
                });
            }
        });
    }catch (err){
        console.log(err);
    }
    });
    
    router.post("/similarPeople",function(req,res){
    try{
//        //getting users categories
//        var query_user_categories = "SELECT * FROM ?? WHERE ??=?";
//        var data_user_categories = ["category_user","user_id",req.params.user_id];
//        query_user_categories = mysql.format(query_user_categories,data_user_categories);
//        
//        connection.query(query_user_categories,function(err,rows){
//            
//            if(rows.length==0){
//                res.json({"Error" : true, "Message" : "User not found"});
//            }
//            var  similarPeopleList = [];
//            if(err) {
//                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
//            } else {
//                var i = 0;
        var  similarPeopleList = [];
        console.log(req.body.categoryList);
                
                req.body.categoryList.forEach(function(datum, i){

                    //getting people with simliar categories
                    var query_categories = "SELECT * FROM ?? WHERE ??=?";
                    var data_categories = ["category_user","category_name",req.body.categoryList[i]];
                    query_categories = mysql.format(query_categories,data_categories);
                    //console.log(query_categories);
                    
                    connection.query(query_categories,function(err,rows_cat){
                        if(err) {
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
//                            Add Two-dimentianal array
                            var flag = 1;
                            
                            for(var j = 0; j<rows_cat.length; j++){
                                console.log(rows_cat[j]);
                                if (similarPeopleList.includes(rows_cat[j].user_id)) {
                                    //In array so add points 
                                } else {
                                    //Not in array  
                                    if(rows_cat[j].user_id != req.params.user_id){
                                        //add points here
                                    similarPeopleList.push(rows_cat[j].user_id);
                                    }
                                }
                            }
                                                
                            console.log(i);
                            if(i==req.body.categoryList.length-1){
                                console.log(similarPeopleList); 
                                res.json({"Error" : false, "Message" : "Success", "Users" : similarPeopleList});
                            } 
                        }
                       
                    });
                });
    }catch (err){
        console.log(err);
    }
    });
    
    
    
    
       router.post("/categories",function(req,res){
           console.log(req.body);
                try{
                    
                for (var i = 0; i < req.body.category_set.length; i++){
                    var query_category = "INSERT INTO ??(??,??) VALUES(?,?)"
                    var data_category = ["category_user", "category_name", "user_id", req.body.category_set[i], req.body.user_id];
                    
                    query_category = mysql.format(query_category,data_category);
                    connection.query(query_category,function(err,rows){
                        if(err) {
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
                            console.log("category added");
//                            res.json({"Error" : false, "Message" : "Categories Added !"});
                        }
                    });
                }
                    res.json({"Error" : false, "Message" : "User Successfully Added!"});
                }catch (err){
                    console.log(err);
                }
        });
    
}
module.exports = REST_ROUTER;
