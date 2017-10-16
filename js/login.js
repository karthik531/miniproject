window.onload = function()
{
    document.getElementById('LOGIN').addEventListener('click', manageLogin, false);
    document.getElementById('GSIGNIN').addEventListener('click', manageGoogleSignin, false);
    initApp();
};
function manageGoogleSignin()
{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error)
	{
		console.log(error.message);
	});
}
function manageLogin()
{
    var flag = 0;
    var passexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,15})");
    var email = document.getElementById("EMAIL").value.trim();
    var password = document.getElementById("PASSWORD").value.trim();

    if(email == "")
    {
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid email address";
    }
    if(!passexp.test(password))
    {
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid Password";
    }
    
    if(flag == 0)
    {
        document.getElementById("ERROR").innerHTML = "";
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error)
        {
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
    }
}
function initApp()
{
    firebase.auth().onAuthStateChanged(function(user)
    {
        if(user )
        {
				if(user.displayName!=null)
				{
						var docData = {
						useremail: user.email,
						username: user.displayName,
						userid: user.uid
					};
					firebase.firestore().collection("users").doc(user.email).set(docData).then(function() 
					{
						console.log("Document successfully written!");
						window.location.href = "welcome.html";
					});
				}
				else
				window.location.href = "welcome.html";
        }
    });
}
