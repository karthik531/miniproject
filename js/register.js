function manageSignup()
{
    document.getElementById("loader").style.display = "block";
    document.getElementById("form").style.display = "none";
    var flag = 0;
    var passexp = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,15})");
    var email = document.getElementById("EMAIL").value.trim();
    var password = document.getElementById("PASSWORD").value.trim();
    var cpassword = document.getElementById("CPASSWORD").value.trim();
	name = document.getElementById("NAME").value.trim();
    //validation of format
    if(name == "" || !passexp.test(password))
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid Username or Password";
    }
    if(password != cpassword)
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Password fields must be equal";
    }
    if(email == "")
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("form").style.display = "block";
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid email address";
    }
	/*---------------------------------*/
	//document.cookie = "username="+name;
	/*---------------------------------*/
    if(flag == 0)   //valid format
    {
        document.getElementById("ERROR").innerHTML = "";
        var promise = firebase.auth().createUserWithEmailAndPassword(email,password); 
            promise.catch(function(error)
            {
               
                alert(error.message);
                clearLoaderAndInfo();
            });
            firebase.auth().onAuthStateChanged(function(user)
            {
                if(user)
                {
                    user_ref = user;
                    //insertInfoAndProceed();

                    var actionCodeSettings = {
                        url: 'https://pokeavathar.000webhostapp.com/public/user-verification.html?email='+email+'&username='+name+'&uid='+user.uid
                    }

                    firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
                      .then(function() {
                        alert("Verification email sent!! Please verify email and login");
                        clearLoaderAndInfo();
                      })
                      .catch(function(error) {
                        alert("Error occurred!! verification mail cant be sent to you");
                        clearLoaderAndInfo();
                      });
                }
            });
    }
}
function clearLoaderAndInfo()
{
	 document.getElementById("loader").style.display = "none";
     document.getElementById("form").style.display = "block";
	 document.getElementById("EMAIL").value = "";
	 document.getElementById("PASSWORD").value = "";
	 document.getElementById("CPASSWORD").value = "";
	 document.getElementById("NAME").value = "";
}
function insertInfoAndProceed()
{
			var docData = {
				email: user_ref.email,
                uid: user_ref.uid,
                uname: name,
                verified: false
			};
			//var db  = firebase.firestore().collection("users").where("useremail","==",user_ref.email);
			//db.get().then(function(query)
			//{
				//if(query.empty)
				//{
					firebase.firestore().collection("users").doc().set(docData).then(function() 
					{
					//window.location.href = "welcome.html";
                        alert("VERIFY EMAIL");
					});
				//}
			//});
}
