function manageSignup()
{

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
	name = document.getElementById("NAME").value.trim();
    //validation of format
    if(name == "" || !passexp.test(password))
    {
        flag = 1;
        document.getElementById("ERROR").innerHTML = "Invalid Username or Password";
    }
    if(email == "")
    {
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
        promise.catch(function(error){
            console.error("ERROR CREATING USER");
        });
        firebase.auth().onAuthStateChanged(function(user)
	    {
            if(user)
            {
                user_ref = user;
                insertInfoAndProceed();
            }
        });
    }
}
function insertInfoAndProceed()
{
			var docData = {
				useremail: user_ref.email,
				username: name,
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
			});
}
