var name = "";
window.onload = function() 
{
  document.getElementById('SIGNUP').addEventListener('click', manageSignup, false);
  initApp();
};
function manageSignup()
{
    var email = document.getElementById("EMAIL").value;
    var password = document.getElementById("PASSWORD").value;
	name = document.getElementById("NAME").value;
	/*---------------------------------*/
	//document.cookie = "username="+name;
	/*---------------------------------*/
    var promise = firebase.auth().createUserWithEmailAndPassword(email,password); 
	promise.catch(function(error){
		console.error("ERROR CREATING USER");
	});
	
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