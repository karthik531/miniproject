function manageGoogleSignin()
{
    document.getElementById("loader").style.display = "block";
    document.getElementById("form").style.display = "none";
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error)
	{
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
		alert(error.message);
	});
	initLoginProcess();
}
function manageLogin()
{
    document.getElementById("loader").style.display = "block";
    document.getElementById("form").style.display = "none";
    var flag = 0;
    var passexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,15})");
    var email = document.getElementById("EMAIL").value.trim();
    var password = document.getElementById("PASSWORD").value.trim();

    if(email == "")
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid email address";
    }
    if(!passexp.test(password))
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid Password";
    }
    
    if(flag == 0)
    {
        document.getElementById("ERROR").innerHTML = "";
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error)
        {
            document.getElementById("loader").style.display = "none";
            document.getElementById("form").style.display = "block";
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password')
            {
                document.getElementById("ERROR").innerHTML = "Invalid Password";
            }
            else
            {
                alert(errorMessage);
            }
            console.log(error);
        });
        initLoginProcess();
    }
}
function initLoginProcess()
{
	firebase.auth().onAuthStateChanged(function(user)
    {
        if(user)
        {
				if(user.displayName!=null)
				{
					user_ref = user;
					insertGoogleCredentials();
				}
				else
                {
                    var query = firebase.firestore().collection("users").where("uid", "==", user.uid);					
                    query.get().then(function(querySnapshot)
                    {
                        querySnapshot.forEach(function(doc) 
                        {
                            var val = doc.data().verified;
                            if(val){
                                window.location.href = "welcome.html"
                            }
                            else{
                                window.location.html = "index.html"
                                alert("verify your mail");
                            }
                        });
        
                    });
				    
                }
        }
    });
}

function resetPassword()
{
    var auth = firebase.auth();
    var emailAddress = document.getElementById("reset-email").value;
    
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      // Email sent.
        alert("An Email containing a password reset link has been sent to the provided email address");
    }).catch(function(error) {
      // An error happened.
        alert("Could'nt send email");
    });
}

function insertGoogleCredentials()
{
	var docData = {
		email: user_ref.email,
        uid: user_ref.uid,
        uname: name,
        verified: true
	};
	var db  = firebase.firestore().collection("users").where("useremail","==",user_ref.email);
	db.get().then(function(query)
	{
		if(query.empty)
		{
			firebase.firestore().collection("users").doc().set(docData).then(function() 
			{
			window.location.href = "welcome.html";
			});
		}
		else
		{
			window.location.href = "welcome.html";
		}
	});
}
window.onload = function(){
   initLoginProcess();
};