function manageSignup()
{
    document.getElementById("loader").style.display = "block";
    document.getElementById("form").style.display = "none";
    var flag = 0;
//REF_URL = https://www.mkyong.com/regular-expressions/how-to-validate-password-with-regular-expression/
//var orig_patt = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})");
//var our_patt = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})"); 
	
/* 
	           **** DESCRIPTION ABOUT OUR_PAT REGEX ******* 
6 to 15 characters string with at least one digit, one upper case letter, one lower case letter and optional special symbol
*/
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
                document.getElementById("loader").style.display = "none";
                document.getElementById("form").style.display = "block";
                console.error("ERROR CREATING USER");
            });
            firebase.auth().onAuthStateChanged(function(user)
            {
                if(user)
                {
                    user_ref = user;
                    //insertInfoAndProceed();

                    var actionCodeSettings = {
                        url: 'https://localhost/user-verification.html?email='+email+'&username='+name+'&uid='+user.uid
                    }

                    firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
                      .then(function() {
                        alert("Verification email sent");
                      })
                      .catch(function(error) {
                        alert("Error occurred");
                      });
                }
            });
    }
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