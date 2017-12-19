window.onload = function()
{ 
   
    initApp();
    firstClick = true;
    isPostUpdate = false;
    getAbout();
};

function initApp()
{
    firebase.auth().onAuthStateChanged(function(user)
    {
        if(user)
        {
			user_ref = user;  
			getName();
		}
        else
        {
            window.location.href = "index.html";
        }
    });
}

function getName()
{
	if(user_ref.displayName==null)
	{
		user_name = localStorage.getItem(user_ref.email);
		if(user_name!=null)          
		{ 
			document.getElementById("und").innerHTML  = localStorage.getItem(user_ref.email);
		}
		else         
		{
			var query = firebase.firestore().collection("users").where("email", "==", user_ref.email);
			query.get().then(function(querySnapshot) 
			{
				if(!querySnapshot.empty)
				{
					var docRef = querySnapshot.docs[0];
					var user_name = docRef.data().uname;
					localStorage.setItem(user_ref.email,user_name);
					document.getElementById("und").innerHTML = user_name;
				}
			});						
		}	 
	}
	else
	{
		localStorage.setItem(user_ref.email,user_ref.displayName);
		document.getElementById("und").innerHTML =user_ref.displayName;
	}
	document.getElementById("ued").innerHTML = user_ref.email;
}

function handleSignOut()
{
    firebase.auth().signOut();
}

function displaySupporter(x)
{
    if(x=="none" && firstClick)
       firstClick = false;
    else if(x=="none" && !firstClick)
        document.getElementById(presentId).style.display = "none";
    
}


function insertEditor()
{
    var x = document.getElementById("editor").style.display;
    displaySupporter(x);
    document.getElementById("editor").style.display = "block";
    presentId = "editor";
}  


function insertQuestion()
{
    var question = document.getElementById("questionbox").value;
    if(question=="") 
    {
        alert("EMPTY QUESTION NOT ACCEPTED");
        return;
    }
    var user_name = document.getElementById("und").innerHTML;
    //alert(user_ref.uid)
    var questionData = {question: question,uid: user_ref.uid,username : user_name ,views: 0};
    var promise = firebase.firestore().collection("questions").doc().set(questionData);
    document.getElementById("questionbox").value = "";
}

function getQuestions()
{
    document.getElementById("loader").style.display = "block";
    var question_path = firebase.firestore().collection("questions");
    question_path.orderBy("views","desc").onSnapshot(function(querySnapshot) 
    {
         var questionString = "";
            querySnapshot.forEach(function(doc) 
            { 

                questionString = questionString+'<div id ="ind-question" onclick=getQuestionContent("'+doc.id+'")>'+
                '<p id="qusername">'+doc.data().username+'&nbsp&nbsp&nbsp<span>'+'views::'+doc.data().views+'</span></p>'+
               
                '<p id="question-text">'+doc.data().question+'</p>'+
                '</div>'
            });
            document.getElementById("loader").style.display = "none";
            var x = document.getElementById("questions").style.display;
            displaySupporter(x);
            document.getElementById("questions").style.display = "block";
            presentId = "questions";
            document.getElementById("questionlist").innerHTML = questionString;
    });
} 

function getQuestionContent(docId)
{
    document.getElementById("loader").style.display = "block";
    var questionpath = firebase.firestore().collection("questions").doc(docId);
    answerpath = questionpath.collection("comments");
    
    questionpath.get().then(function(doc)
    {
        if(doc && doc.exists)
        {
            var count = doc.data().views+1;
            questionpath.update({views:count}).then(function()
            {
                document.getElementById("loader").style.display = "none";
                document.getElementById("questions").style.display = "none";
                document.getElementById("your-submissions").style.display = "none";
                
                var x = document.getElementById("questioncontent").style.display;
                displaySupporter(x);
                document.getElementById("questioncontent").style.display = "block";
                presentId = "questioncontent";
                document.getElementById("question").innerHTML = doc.data().question;
                mail_uid = doc.data().uid;  //used for email notification
                
            });
            
        }
         getAllAnswers(); 
    });  
}

function gotoCards()
{
    document.getElementById("cardcontent").style.display = "none";
    document.getElementById("cards").style.display = "block";
    presentId = "cards";
    
}
function gotoCompanies()
{
    document.getElementById("company-content").style.display = "none";
    document.getElementById("companylist").style.display = "block";
    presentId = "companylist";
    
}
function gotoQuestions()
{
     document.getElementById("questioncontent").style.display = "none";
    document.getElementById("questions").style.display = "block";
    presentId = "questions";
   
}

function getAllAnswers()
{
    answerpath.onSnapshot(function(querySnapshot) 
    {
        var answerString = "";
        querySnapshot.forEach(function(doc) 
        {
            username = doc.data().username;
            comment = doc.data().comment;
            answerString += "<div id='ind-answer'><p id='ausername'>"+ username +"</p>"
            answerString+="<p id='answer'>"+ comment +"</p></div>"    
        });
        
        document.getElementById("answers").innerHTML = answerString;
    });
}

function insertAnswer()
{
    var answer = document.getElementById("answer-box").value;
    if(answer=="")
    {
        alert("empty answer not accepted");
    }
    else
    {
        var user_name = document.getElementById("und").innerHTML;
        var now = new Date(); 
        var user_uid = user_ref.uid;
var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var answerData = {comment: answer,time: utc,uid: user_uid,username: user_name};
        document.getElementById("answer-box").value = "";
        var promise = answerpath.doc().set(answerData).then(function(){
            
            if(user_uid!=mail_uid){
                
                var db  = firebase.firestore().collection("users").where("uid","==",mail_uid);
                
                db.get().then(function(querySnapshot) 
                {
                    querySnapshot.forEach(function(doc) 
                    {
                        var toEmail = doc.data().email;
                        var rusername = doc.data().uname;                       
                        var message = answer;
                        var qstn =  document.getElementById("question").innerHTML;
                        //alert(user_name);
                        sendMail(toEmail,answer,rusername,user_name,qstn);
                    });
                });
            }
            
        });
    }//else
}

function sendMail(toEmail,answer,rusername,susername,qstn)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
    }
  };
  
  xhttp.open("POST", "sendmail.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send('tomail=pokeavathar@gmail.com&question='+qstn+'&message='+answer+'&rusername='+rusername+'&susername='+susername);
}
function getInterviewExperiences()
{
    
    
     document.getElementById("loader").style.display = "block";
    
	path = firebase.firestore().collection("ie");
   
    path.orderBy("views","desc").onSnapshot(function(querySnapshot) 
    {
            var docIdString = "";
            querySnapshot.forEach(function(doc) 
            { 

                docIdString = docIdString+'<div id ="ind-card" onclick=getAllContent("'+doc.id+'")>'+
                '<div id="company-and-user-name">'+
                '<span id="company-name">'+'Company Name:'+doc.data().companyName+'</span>'+
                '<span id="user-name">'+'written by:'+doc.data().username+'</span></div><br>'+
                '<div id="views-and-hired">'+
                '<span id="ieviews">'+'views:'+doc.data().views+'</span>'+
                '<span id="isHired">'+'Hired:'+doc.data().isHired+'</span>'+
                '</div></div><br>'
            });
            
            document.getElementById("loader").style.display = "none";
            
            var x = document.getElementById("cards").style.display;
            displaySupporter(x);
            document.getElementById("cards").style.display = "block";
            presentId = "cards";
            
            
            document.getElementById("cards").innerHTML = docIdString;
    });
}



function getAllContent(docId)
{
    
    document.getElementById("loader").style.display = "block";
    document.getElementById("description").innerHTML = "";
    document.getElementById("comments").innerHTML = "";
    
    var descriptionpath = path.doc(docId);
    
    commentpath = descriptionpath.collection("comments");
    
    descriptionpath.get().then(function(doc) 
    {
        
            if(doc && doc.exists)
            {
                //document.getElementById("description").innerHTML = doc.data().description;
                var count = doc.data().views+1;
               
                  descriptionpath.update({views:count}).then(function()
                  {
                    document.getElementById("loader").style.display = "none";
                    document.getElementById("cards").style.display = "none";
                    document.getElementById("your-submissions").style.display = "none";
                      
                    document.getElementById("cardcontent").style.display = "block";
                    presentId = "cardcontent";
                    document.getElementById("description").innerHTML = doc.data().description;
                    
                  });
            }
        
    });


   getAllComments();
}

function insertComment()
{
    var com = document.getElementById("comment-box").value;
    if(com=="")
    {
        alert("empty comment not accepted");
    }
    else
    {
        var user_name = document.getElementById("und").innerHTML;
         var now = new Date(); 
var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var commentData = {comment:com,time:utc,username:user_name};
        var promise = commentpath.doc().set(commentData);
        document.getElementById("comment-box").value = "";
    }
}

function getAllComments()
{
   
    
    commentpath.onSnapshot(function(querySnapshot) 
    {
        var commentString = "";
        querySnapshot.forEach(function(doc) 
        {
            username = doc.data().username;
            comment = doc.data().comment;
            commentString += "<div id='ind-comment'><p id='cusername'>"+ username +"</p>"
            commentString+="<p id='comment'>"+ comment +"</p></div>"    
        });
        document.getElementById("comments").innerHTML = commentString;
    });
}

/*** YOUR SUBMISSIONS START ********/
function getYourSubmissions()
{
    document.getElementById("loader").style.display = "block";
    var x = document.getElementById("your-submissions").style.display;
    displaySupporter(x);
    document.getElementById("your-submissions").style.display = "block";
    presentId = "your-submissions";
    getYourIE(user_ref.uid);
}

function getYourIE(userid)
{
   
    firebase.firestore().collection("ie").where("uid", "==", userid).onSnapshot(function(querySnapshot)
    {
        var docIdString = "";
         var flag =  0;
        querySnapshot.forEach(function(doc) 
        {
              docIdString = docIdString+
                '<div id ="ind-card" style="width:70%;float:left;margin-bottom:3%;margin-right:10px">'+
                    '<span id="company-name">'+doc.data().companyName+'</span>'+
                    '<span id="user-name">'+doc.data().username+'</span>'+
                '</div>'+
                '<table align="center" style="margin-bottom:4%;margin-left:0px">'+
                    '<tr>'+
                        '<td><button id="editIE" class="edit-button edit-button1" onclick=editPost("'+doc.id+'")>Edit</button></td>'+
                    '</tr>'+
                    '<tr>'+
                        '<td><button class="del-button del-button1" onclick=deletePost("'+doc.id+'")>Delete</button></td>'+
                    '</tr>'+
                '</table>';
                flag = 1;
        });
        if(flag == 0){
            docIdString = "<h1>You have not submitted any posts!!!</h1>";
        }
        getYourQuestions(userid,docIdString);
    });
}

function getYourQuestions(userid,IEString)
{
    var flag = 0;
    firebase.firestore().collection("questions").where("uid", "==", userid).onSnapshot(function(querySnapshot)
    {
        var docIdString = "";
        querySnapshot.forEach(function(doc) 
        {
            //alert(doc.data().question);
            docIdString+=
            '<table style="margin-left:5%">'+
                '<tr>'+
                    '<td><input type="text" class="textfield" id="'+doc.id+'" value="'+doc.data().question+'" disabled></td>'+
                    '<td><button id="edit" class="edit-button edit-button1" onclick=editQuestion("'+doc.id+'")>Edit</button></td>'+
                    '<td>'+
                    '<button class="del-button del-button1" onclick=deleteQuestion("'+doc.id+'")>Delete</button></td>'+
                '</tr>'+
            '</table>';
            flag = 1;
        });
        if(flag==0){

            docIdString = "<h1>You have not asked any questions!!!</h1>";
        }
        document.getElementById("loader").style.display = "none";
       /* var x = document.getElementById("your-submissions").style.display;
        displaySupporter(x);
        document.getElementById("your-submissions").style.display = "block";
        presentId = "your-submissions";*/
        document.getElementById("yourcards").innerHTML = IEString;
        document.getElementById("yourquestions").innerHTML = docIdString;
        
    });
}

function editPost(doc_id)
{
    isPostUpdate = true;
    updateDocId = doc_id;
    firebase.firestore().collection("ie").doc(doc_id).get().then(function(doc)
    {
        if(doc && doc.exists)
        {
            
            insertEditor();
            document.getElementById("titleID").value= doc.data().title;
            document.getElementById("companyID").value=doc.data().companyName;
            tinymce.get("texteditor").setContent(doc.data().description);
            document.getElementById("hired").checked = doc.data().isHired;
        }
    });
            
}

function editQuestion(doc_id)
{
   var isDisabled = document.getElementById(doc_id).disabled;
   if(isDisabled){
       
       document.getElementById(doc_id).disabled = false;
       document.getElementById("edit").innerHTML = "Save";
       orig_question = document.getElementById(doc_id).value;
   }
   else{
        var new_qstn = document.getElementById(doc_id).value;
        if(new_qstn!=orig_question){
            firebase.firestore().collection("questions").doc(doc_id).update({question:new_qstn}).then(function(){
               alert("QUESTION UPDATED SUCCESSFULLY");
            }).catch(function(){
                alert("ERROR !! QUESTION NOT UPDATED")
            });
        }   
        document.getElementById(doc_id).disabled = true;
        document.getElementById("edit").innerHTML = "Edit";
    }

}
function changeCloseImage()
{
    document.getElementById("exp-close-image").src = "images/backbutton-final.jpg";
    document.getElementById("question-close-image").src = "images/backbutton-final.jpg";
}

function revertCloseImage()
{
    document.getElementById("exp-close-image").src = "images/backbutton-init.png";
    document.getElementById("question-close-image").src = "images/backbutton-init.png";
}

function deleteSubmissions(doc_id,collection,sub_collection)
{
    var deletepath = firebase.firestore().collection(collection).doc(doc_id).collection(sub_collection);
    deletepath.onSnapshot(function(querySnapshot) 
    {
        querySnapshot.forEach(function(doc) 
        {
            deletepath.doc(doc.id).delete();
        });
    });
    
    firebase.firestore().collection(collection).doc(doc_id).delete().then(function(){
       alert("SUBMISSION DELETED"); 
    }).catch(function(){
        alert("ERROR DELETING SUBMISSION");
    });
}

function deletePost(doc_id)
{
    deleteSubmissions(doc_id,"ie","comments");
    
}

function deleteQuestion(doc_id)
{
    deleteSubmissions(doc_id,"questions","comments");
    
}
/*** YOUR SUBMISSIONS CLOSE ********/

/** POST INSERTION LOGIC START ********/

function insertPost()
{
    var user_name = localStorage.getItem(user_ref.email);
	var title_name = document.getElementById("titleID").value.toUpperCase();
	var company_name= document.getElementById("companyID").value.toUpperCase();
	var content =  tinymce.get("texteditor").getContent();
    var user_id = user_ref.uid;
    var isHired = false;
    if(document.getElementById("hired").checked==true)
    {
        isHired = true;
    }
    var colRef = firebase.firestore().collection("company");
    var experience = null;
    if(!isPostUpdate)
    {
	    experience = getPostObject(company_name,content,isHired,title_name,user_id,user_name,isPostUpdate);
        colRef.where("name", "==", company_name).get().then(function(querySnapshot) 
        {
            if(querySnapshot.empty)
            {
                DocRef = colRef.add({
                name: company_name,
                count: 1
                });
            }
            else
            {
                var DocRef = querySnapshot.docs[0];
                var doc_id = DocRef.id;
                var md_ct = DocRef.data().count+1;

                colRef.doc(doc_id).update({
                count: md_ct
                });
            }
        });
        
        firebase.firestore().collection("ie").doc().set(experience).then(function()
        {
		     alert("post submitted");
             clearEditor();
        }).catch(function(error) 
        {
            console.error("Error writing document: ", error);
        }); 

    }
    if(isPostUpdate)
    {
       experience = getPostObject(company_name,content,isHired,title_name,user_id,user_name,isPostUpdate);
        postRef = firebase.firestore().collection("ie").doc(updateDocId).update(experience).then(function(){
            isPostUpdate = false;
            alert("post submitted");
            clearEditor();
        }).catch(function(error) 
        {
            console.error("Error writing document: ", error);
        }); 
            
    }
}

function getPostObject(company_name,content,isHired,title_name,user_id,user_name,isPostUpdate)
{
   
    if(!isPostUpdate)
       return  {companyName: company_name,description: content,isHired: isHired,title: title_name,uid: user_id,username: user_name,views: 0}
    else
        return {companyName: company_name,description: content,isHired: isHired,title: title_name,uid: user_id,username: user_name}
}

function clearEditor()
{
    document.getElementById("titleID").value="";
    document.getElementById("companyID").value="";
    tinymce.get("texteditor").setContent("");
    document.getElementById("hired").checked = false;
}

/** POST INSERTION LOGIC END ********/

/*** SETTINGS CLICK START ********/
function getSettings()
{
    
    document.getElementById("loader").style.display = "block";
    var x = document.getElementById("settings").style.display;
    displaySupporter(x);
    document.getElementById("settings").style.display = "block";
    presentId = "settings";
    retrieveProfile();
}

function retrieveProfile()
{
   document.getElementById("uname-setting-field").value = document.getElementById("und").innerHTML;
   document.getElementById("email-setting-field").value = document.getElementById("ued").innerHTML;
    document.getElementById("loader").style.display = "none";
}

function editUname()
{
    var isDisabled  = document.getElementById("uname-setting-field").disabled;
    if(isDisabled){
       
       document.getElementById("uname-setting-field").disabled = false;
       document.getElementById("uname-setting-toggle").innerHTML = "Save";
       orig_name = document.getElementById("uname-setting-field").value;
   }
   else
   {
       var new_name = document.getElementById("uname-setting-field").value;
       if(new_name!=orig_name)
       {
           firebase.firestore().collection("users").where("uid","==",user_ref.uid).get().then(function(querySnapshot)
           {
                querySnapshot.forEach(function(doc)
                {
                    if(doc && doc.exists)
                    {

                            firebase.firestore().collection("users").doc(doc.id).update({uname:new_name}).then(function()
                            {
                                localStorage.setItem(user_ref.email,new_name);
                                document.getElementById("und").innerHTML = new_name;
                                document.getElementById("uname-setting-field").disabled = true;
                                document.getElementById("uname-setting-toggle").innerHTML = "Edit";

                            }).catch(function(){
                                alert("ERROR !! USERNAME NOT UPDATED")
                            });    

                    }    
                });
           });
       }
       else{
           document.getElementById("uname-setting-field").disabled = true;
           document.getElementById("uname-setting-toggle").innerHTML = "Edit";
       }
    }
}

function changePasswordToggle()
{
    document.getElementById("reauth-setting-block").style.display = "block";
    document.getElementById("reauthenticate").addEventListener('click',reauthenticateChangePassword);
}

function deleteAccount()
{
    document.getElementById("reauth-setting-block").style.display = "block";
    document.getElementById("reauthenticate").addEventListener('click',reauthenticateDelete);
}
function reauthenticateChangePassword(){
    
    reauthenticate("CHANGE_PASSWORD");
}
function reauthenticateDelete(){
    reauthenticate("DELETE_USER");
}
function reauthenticate(mode)
{
    
    var reauth_email = document.getElementById("reauth-email-setting-field").value;
    var reauth_old_password = document.getElementById("reauth-old-password-field").value;
    var credential = firebase.auth.EmailAuthProvider.credential(reauth_email,reauth_old_password);
    
    user_ref.reauthenticateWithCredential(credential).then(function()
    {
        if(mode=="CHANGE_PASSWORD")
        {
            document.getElementById("new-password-block").style.display = "block";
        }
        else if(mode=="DELETE_USER")
        {
            user_ref.delete().then(function(){
               alert("account successfully deleted");
               handleSignOut();
            }).catch(function(error){
               alert("error message "+error.message);
            }); 
        }
    }).catch(function(error){
        alert("invalid user!! Please check your credentials");
        
    });
    
}
function changePassword()
{
    var new_password  = document.getElementById("reauth-new-password-field").value;
    var passexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,15})");
    if(new_password.trim()=="" || !passexp.test(new_password))
    {
          alert("Should contain at least one uppercase letter, one lowercase letter and a number. Minimum of 8 characters.");
    }
    else{
        user_ref.updatePassword(new_password).then(function()
        {
           alert("YOUR PASSWORD IS UPDATED SUCCESSFULLY");
           handleSignOut();
        }).catch(function(error)
        {
            alert("error message "+error.message);
        });
    }
}
/*** SETTINGS CLICK END ********/

/*** ABOUT CLICK START *****************/
function getAbout()
{
    var x = document.getElementById("about").style.display;
    displaySupporter(x);
    document.getElementById("about").style.display = "block";
    presentId = "about";
}
/***** ABOUT CLICK END *****************/


/*** GET COMPANIES START ********/

function getCompanyContent(docid)
{
    document.getElementById("companyDescription").innerHTML = "";
    document.getElementById("loader").style.display = "block";
    firebase.firestore().collection("companies").doc(docid).get().then(function(doc) 
    {
        
            if(doc && doc.exists)
            {
                document.getElementById("loader").style.display = "none";
                document.getElementById("companylist").style.display = "none";
                document.getElementById("your-submissions").style.display = "none";
                      
                document.getElementById("company-content").style.display = "block";
                presentId = "company-content";
                document.getElementById("companyDescription").innerHTML = doc.data().description;
            }
        
    });
}
function getCompanies()
{
    document.getElementById("loader").style.display = "block";
    var companylist = "";
    firebase.firestore().collection("companies").get().then(function(querySnapshot){
        companylist = "";
       querySnapshot.forEach(function(doc)
       {
            companylist = companylist+'<div id ="company-card" onclick=getCompanyContent("'+doc.id+'")>'+
                '<span id="companyName">'+'Company Name:'+doc.data().title+'</span>'+
                '<span id="NoOfEmp">'+'Employees:'+doc.data().NoOfEmp+'</span>'+
                '<span id="rating">'+'Rating:'+doc.data().rating+'</span>'+
                '<span id="companyYear">'+'Hired:'+doc.data().year+'</span>'+
                '<img id="company-pic"src='+doc.data().url+'>'+
                '</div><br>'
       }); 
        document.getElementById("loader").style.display = "none";
        var x = document.getElementById("companylist").style.display;
        displaySupporter(x);
        document.getElementById("companylist").style.display = "block";
        presentId =  "companylist";
        document.getElementById("companylist").innerHTML = companylist;
    });
}
/*** GET COMPANIES END ********/
 
/*** GET TIPS START ********/

function getTipContent(docid)
{
    document.getElementById("tiplist").innerHTML = "";
    document.getElementById("loader").style.display = "block";
    firebase.firestore().collection("tips").doc(docid).get().then(function(doc) 
    {
        
            if(doc && doc.exists)
            {
                var count = doc.data().views+1;
                firebase.firestore().collection("tips").doc(docid).update({views:count}).then(function(){       
                document.getElementById("loader").style.display = "none";
                document.getElementById("tiplist").style.display = "none";
                document.getElementById("tipDescription").style.display = "block";
                presentId = "tipDescription";
                document.getElementById("tipcontent").innerHTML = doc.data().description;
                document.getElementById("tviews").innerHTML = count; 
                });
            }
        
    });
    getTipComments(docid)
}
function getTipComments(docid)
{
    tippath = firebase.firestore().collection("tips").doc(docid).collection("comments");
    tippath.onSnapshot(function(querySnapshot) 
    {
        var commentString = "";
        querySnapshot.forEach(function(doc) 
        {
            commentString += "<div id='ind-comment'><p id='tusername'>"+ doc.data().username +"</p>";
            commentString+="<p id='comment'>"+ doc.data().comment +"</p></div>" ;
        });

        document.getElementById("tipcomments").innerHTML = commentString;
    });
}

function insertTipComment()
{
    var com = document.getElementById("tip-comment-box").value;
    if(com=="")
    {
        alert("empty comment not accepted");
    }
    else
    {
        var user_name = document.getElementById("und").innerHTML;
         var now = new Date(); 
var utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var commentData = {comment:com,time:utc,username:user_name};
        var promise = tippath.doc().set(commentData);
        document.getElementById("tip-comment-box").value = "";
    }
}

function getTips()
{
    document.getElementById("loader").style.display = "block";
    var tiplist = "";
    firebase.firestore().collection("tips").get().then(function(querySnapshot){
       tiplist = "";
       querySnapshot.forEach(function(doc)
       {
            tiplist = tiplist+'<div id ="tip-card" onclick=getTipContent("'+doc.id+'")>'+
                '<span id="tipTitle" style="float: left">'+doc.data().title+'</span>'+
                '<span id="tviews" style="float: right">views: '+doc.data().views+'</span>'+
                '</div><br>'
       }); 
        document.getElementById("loader").style.display = "none";
        var x = document.getElementById("tiplist").style.display;
        displaySupporter(x);
        document.getElementById("tiplist").style.display = "block";
        presentId =  "tiplist";
        document.getElementById("tiplist").innerHTML = tiplist;
    });
}
/*** GET TIP END ********/