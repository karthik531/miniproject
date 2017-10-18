function manageSignup()
{
    var email = document.getElementById("EMAIL").value;
    var password = document.getElementById("PASSWORD").value;
	name = document.getElementById("NAME").value;
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
