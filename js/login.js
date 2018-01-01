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
    var error = "";
    var passexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,15})");
    var email = document.getElementById("EMAIL").value.trim();
    var password = document.getElementById("PASSWORD").value.trim();

    if(email == "")
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        //document.getElementById("ERROR").innerHTML = "Invalid email address";
        error+="Invalid Email address";
    }
    if(!passexp.test(password))
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        //document.getElementById("ERROR").innerHTML = "Invalid Password";
        error+=" Invalid password";
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
    else{
        document.getElementById("ERROR").innerHTML = error;
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
					//user_ref = user;
					//insertGoogleCredentials();
                    firebase.firestore().collection("users").where("email","==",user.email).
                    get().then(function(query)
                    {
                        if(query.empty)
                        {
                             var docData = 
                             {
                                email: user.email,
                                uid: user.uid,
                                uname: user.displayName,
                                verified: true
                             };

                            lflag = !lflag;

                            if(lflag)
                            {
                                firebase.firestore().collection("users").doc().set(docData).then(function() 
                                {
                                    localStorage.setItem("gl","true");
                                     window.location.href = "welcome.html";

                                });
                            }
                        }
                        else
                        {
                            localStorage.setItem("gl","true");
                            window.location.href = "welcome.html";
                        }
                    });
				}
				else
                {
                    var query = firebase.firestore().collection("users").where("uid", "==", user.uid);					
                    query.get().then(function(querySnapshot)
                    {
                        querySnapshot.forEach(function(doc) 
                        {
                            var val = doc.data().verified;
                            if(val || user.emailVerified){
                                document.getElementById("loader").style.display = "none";
                                localStorage.setItem("gl","false");
                                window.location.href = "welcome.html"
                            }
                            else
                            {
                                alert("Please verify your mail and then login");
                                document.getElementById("loader").style.display = "none";
                                document.getElementById("form").style.display = "block";
                                
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
        alert("Could'nt send email containing password reset link");
    });
}

function insertGoogleCredentials()
{
	
    
	
}
window.onload = function(){
    lflag = false;
   initLoginProcess();
};