function manageGoogleSignin()
{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error)
	{
		console.log(error.message);
	});
	initLoginProcess();
}
function manageLogin()
{
    var email = document.getElementById("EMAIL").value;
    var password = document.getElementById("PASSWORD").value;

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error)
    {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password')
        {
            alert('Wrong password.');
        }
        else
        {
            alert(errorMessage);
        }
        console.log(error);
    });
	initLoginProcess();
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
				window.location.href = "welcome.html";
        }
    });
}
function insertGoogleCredentials()
{
	var docData = {
		useremail: user_ref.email,
		username: user_ref.displayName,
		userid: user_ref.uid
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
