var name = "";
window.onload = function() 
{
  document.getElementById('SIGNUP').addEventListener('click', manageSignup, false);
  initApp();
};
function manageSignup()
{
    var flag = 0;
    var passexp = new RegExp("(?=^.{8,}$)(?=.*\d)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$");
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
        var promise = firebase.auth().createUserWithEmailAndPassword(email,password); 
        promise.catch(function(error){
            console.error("ERROR CREATING USER");
        });
    }
	
}
function initApp(){
   firebase.auth().onAuthStateChanged(function(user){
		if(user)
		{
			var docData = {
				useremail: user.email,
				username: name,
				userid: user.uid
			};
			firebase.firestore().collection("users").doc(user.email).set(docData).then(function() {
			window.location.href = "welcome.html";
			});
			
		}
   });
}