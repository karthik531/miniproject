window.onload = function()
{
    initApp();
    firstClick = true;
    isPostUpdate = false;
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
    alert(user_ref.uid)
    var questionData = {question: question,uid: user_ref.uid,username : user_name ,views: 0};
    var promise = firebase.firestore().collection("questions").doc().set(questionData);
    
}

function getQuestions()
{
   // document.getElementById("editor").style.display = "none";
    //document.getElementById("cards").style.display = "none";
   // document.getElementById("loader").style.display = "block";
    //presentId = "loader"
    var question_path = firebase.firestore().collection("questions");
   
    question_path.onSnapshot(function(querySnapshot) 
    {
         var questionString = "";
            querySnapshot.forEach(function(doc) 
            { 

                questionString = questionString+'<div id ="ind-question" onclick=getQuestionContent("'+doc.id+'")>'+
                '<p id="qusername">'+doc.data().username+'</p>'+
                '<p id="question-text">'+doc.data().question+'</p>'+
                '</div>'
            });
        
            //document.getElementById("loader").style.display = "none";
            var x = document.getElementById("questions").style.display;
            displaySupporter(x);
            document.getElementById("questions").style.display = "block";
            presentId = "questions";
            document.getElementById("questionlist").innerHTML = questionString;
    });
} 

function getQuestionContent(docId)
{
    var questionpath = firebase.firestore().collection("questions").doc(docId);
    answerpath = questionpath.collection("comments");
    
    questionpath.get().then(function(doc)
    {
        if(doc && doc.exists)
        {
            var count = doc.data().views+1;
            questionpath.update({views:count}).then(function()
            {
                document.getElementById("questions").style.display = "none";
                document.getElementById("questioncontent").style.display = "block";
                presentId = "questioncontent";
                document.getElementById("question").innerHTML = doc.data().question;
                
                mail_uid = doc.data().uid;  //used for email notification
                
            });
            
        }
         getAllAnswers(); 
    });
   
   
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
                        alert(user_name);
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
    //document.getElementById("editor").style.display = "none";
    //document.getElementById("loader").style.display = "block";
	path = firebase.firestore().collection("ie");
   
    path.onSnapshot(function(querySnapshot) 
    {
         var docIdString = "";
            querySnapshot.forEach(function(doc) 
            { 

                docIdString = docIdString+'<div id ="ind-card" onclick=getAllContent("'+doc.id+'")>'+
                '<span id="company-name">'+doc.data().companyName+'</span>'+
                '<span id="user-name">'+doc.data().username+'</span>'+
                '</div><br>'
            });
    
            //document.getElementById("loader").style.display = "none";
            var x = document.getElementById("cards").style.display;
            displaySupporter(x);
            document.getElementById("cards").style.display = "block";
            presentId = "cards";
            document.getElementById("cardcontent").style.display = "none";
            document.getElementById("cards").innerHTML = docIdString;
    });
}

function gotoCards()
{
    document.getElementById("cards").style.display = "block";
    presentId = "cards";
    document.getElementById("cardcontent").style.display = "none";
}

function gotoQuestions()
{
    document.getElementById("questions").style.display = "block";
    presentId = "questions";
    document.getElementById("questioncontent").style.display = "none";
}

function getAllContent(docId)
{
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
                document.getElementById("cards").style.display = "none";
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

function getYourSubmissions()
{
    
    var x = document.getElementById("your-submissions").style.display;
    displaySupporter(x);
    presentId = "your-submissions";
    document.getElementById("your-submissions").style.display = "block";
    getYourIE(user_ref.uid);
    getYourQuestions(user_ref.uid);
}

function getYourIE(userid)
{
    firebase.firestore().collection("ie").where("uid", "==", userid).onSnapshot(function(querySnapshot)
    {
        var docIdString = "";
        querySnapshot.forEach(function(doc) 
        {
              docIdString = docIdString+'<div id ="ind-card">'+
                '<span id="company-name">'+doc.data().companyName+'</span>'+
                '<span id="user-name">'+doc.data().username+'</span>'+
'</div><button id="editIE" onclick=editPost("' +doc.id+ '")>EDIT</button><button onclick=deletePost("'+doc.id+'")>DELETE</button><br>'  
        });
       
        document.getElementById("yourcards").innerHTML = docIdString;
        
    });
}

function getYourQuestions(userid)
{
    firebase.firestore().collection("questions").where("uid", "==", userid).onSnapshot(function(querySnapshot)
    {
        var docIdString = "";
        querySnapshot.forEach(function(doc) 
        {
            
            alert(doc.data().question);
            docIdString+='<input type="text" id="'+doc.id+'" value="'+doc.data().question+'" disabled>'+
            '<button id="edit" onclick=editQuestion("'+doc.id+'")>EDIT</button>'+
            '<button onclick=deleteQuestion("'+doc.id+'")>DELETE</button>';
        });
       
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
       document.getElementById("edit").innerHTML = "save";
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
    }

}

function changeCloseImage()
{
    document.getElementById("exp-close-image").src = "backbutton-final.jpg";
    document.getElementById("question-close-image").src = "backbutton-final.jpg";
}

function revertCloseImage()
{
    document.getElementById("exp-close-image").src = "backbutton-init.png";
    document.getElementById("question-close-image").src = "backbutton-init.png";
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

function clearEditor()
{
    document.getElementById("titleID").value="";
    document.getElementById("companyID").value="";
    tinymce.get("texteditor").setContent("");
    document.getElementById("hired").checked = false;
}

function getPostObject(company_name,content,isHired,title_name,user_id,user_name,isPostUpdate)
{
   
    if(!isPostUpdate)
       return  {companyName: company_name,description: content,isHired: isHired,title: title_name,uid: user_id,username: user_name,views: 0}
    else
        return {companyName: company_name,description: content,isHired: isHired,title: title_name,uid: user_id,username: user_name}
}

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

 