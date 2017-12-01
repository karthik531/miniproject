window.onload = function()
{
    initApp();
    firstClick = true;
};

function handleSignOut()
{
    firebase.auth().signOut();
}

function displayEditor()
{
    document.getElementById("loader").style.display = "none";
    document.getElementById("editor").style.display = "block";
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
//document.getElementById("loader").style.display = "block";
//document.getElementById("editor").innerHTML='<object onload="displayEditor()" width="75%" height="100%" type="text/html" data="editor.html"    //</object>';
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
    var questionData = {username : user_name , question: question,views: 0};
    var promise = firebase.firestore().collection("questions").doc().set(questionData);
    
}

function getQuestions()
{
    var question_path = firebase.firestore().collection("questions");
   
    question_path.onSnapshot(function(querySnapshot) 
    {
         var questionString = "";
            querySnapshot.forEach(function(doc) 
            { 

                questionString = questionString+'<div id ="ind-question" onclick=getQuestionContent("'+doc.id+'")>'+
                '<span id="indquestion">'+doc.data().question+'</span>'+
                '<span id="user-name">'+doc.data().username+'</span>'+
                '</div>'
            });
        
            var x = document.getElementById("questions").style.display;
            displaySupporter(x);
            document.getElementById("questions").style.display = "block";
            presentId = "questions";
            document.getElementById("questionlist").innerHTML = questionString;
    });
} 

function getQuestionContent(docId)
{
    document.getElementById("questions").style.display = "none";
    document.getElementById("questioncontent").style.display = "block";
    presentId = "questioncontent";
    var questionpath = firebase.firestore().collection("questions").doc(docId);
    
    answerpath = questionpath.collection("comments");
    
    questionpath.get().then(function(doc)
    {
        if(doc && doc.exists)
        {
    
            document.getElementById("question").innerHTML = doc.data().question;
        }
    });
    getAllAnswers();

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
            answerString += "<p id='ausername'>"+ username +"</p>"
            answerString+="<p id='answer'>"+ comment +"</p>"    
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
        var answerData = {username : user_name , comment : answer};
        var promise = answerpath.doc().set(answerData);
    }
}

function getInterviewExperiences()
{
	path = firebase.firestore().collection("posts");
   
    path.onSnapshot(function(querySnapshot) 
    {
         var docIdString = "";
            querySnapshot.forEach(function(doc) 
            { 

                docIdString = docIdString+'<div id ="ind-card" onclick=getAllContent("'+doc.id+'")>'+
                '<span id="company-name">'+doc.data().company+'</span>'+
                '<span id="user-name">'+doc.data().username+'</span>'+
                '</div>'
            });
        
            var x = document.getElementById("cards").style.display;
            displaySupporter(x);
            document.getElementById("cards").style.display = "block";
            presentId = "cards";
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
    document.getElementById("cards").style.display = "none";
    document.getElementById("cardcontent").style.display = "block";
    presentId = "cardcontent";
   
    document.getElementById("description").innerHTML = "";
    document.getElementById("comments").innerHTML = "";
    
    var descriptionPath = path.doc(docId);
    
    commentpath = descriptionPath.collection("comments");
    
    descriptionPath.get().then(function(doc)
    {
        if(doc && doc.exists)
        {
            document.getElementById("description").innerHTML = doc.data().description;
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
        var commentData = {username : user_name , comment : com};
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
            commentString += "<p id='cusername'>"+ username +"</p>"
            commentString+="<p id='comment'>"+ comment +"</p>"    
        });
        
        document.getElementById("comments").innerHTML = commentString;
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
			var query = firebase.firestore().collection("users").where("useremail", "==", user_ref.email);
			query.get().then(function(querySnapshot) 
			{
				if(!querySnapshot.empty)
				{
					var docRef = querySnapshot.docs[0];
					var user_name = docRef.data().username;
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



 /* function getName(mail){
	 var cookies = document.cookie;
	 cookarg = cookies.split(';');
	 for(var i=0; i<cookarg.length-1; i+=2)
	 {
		  name = cookarg[i].split('=')[0];
		  value = cookarg[i].split('=')[1];
		  if(mail==value){
			  username = cookarg[i+1].split('=')[1];
			  return username;
		  } 
	} 
	return "";
}*/